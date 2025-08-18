// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {

    // 1. Defina o nome do seu banco de dados em uma variável
    const dbName = 'db_piabot'; 

    // 2. Crie um objeto de opções
    const options = {
      dbName: dbName,
      // Outras opções de conexão podem ser adicionadas aqui, se necessário
      // Ex: useNewUrlParser: true, useUnifiedTopology: true (já são padrão nas versões recentes)
    };
    
    // Conecta ao MongoDB usando a URI do arquivo .env
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log('MongoDB conectado com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    // Encerra o processo com falha se a conexão não for bem-sucedida
    process.exit(1);
  }
};


module.exports = connectDB;
