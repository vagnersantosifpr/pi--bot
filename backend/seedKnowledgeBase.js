// server/seedKnowledgeBase.js
require('dotenv').config();
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs/promises');
const path = require('path');
const Knowledge = require('./models/Knowledge');

// Configuração
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
const JSON_FILE_PATH = path.join(__dirname, '../knowledge_base_data.json');

async function generateEmbeddingsAndSeed() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado.');

    console.log(`Lendo o arquivo de conhecimento de: ${JSON_FILE_PATH}`);
    const fileContent = await fs.readFile(JSON_FILE_PATH, 'utf-8');
    const knowledgeChunks = JSON.parse(fileContent);
    console.log(`${knowledgeChunks.length} chunks de conhecimento encontrados.`);

    // Limpa a coleção existente para evitar duplicatas
    console.log('Limpando a coleção "knowledges" existente...');
    await Knowledge.deleteMany({});

    for (const chunk of knowledgeChunks) {
      console.log(`Gerando embedding para o tópico: "${chunk.topic}"`);
      const result = await model.embedContent(chunk.content);
      const embedding = result.embedding.values;

      await Knowledge.create({
        source: chunk.source,
        topic: chunk.topic,
        content: chunk.content,
        embedding: embedding,
      });
      console.log(`- Chunk salvo no banco de dados.`);
    }

    console.log('\nSeed do banco de dados concluído com sucesso!');
  } catch (error) {
    console.error('\nOcorreu um erro durante o processo de seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB.');
  }
}

generateEmbeddingsAndSeed();