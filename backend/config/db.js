// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Conecta ao MongoDB usando a URI do arquivo .env
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    // Encerra o processo com falha se a conexão não for bem-sucedida
    process.exit(1);
  }
};

module.exports = connectDB;