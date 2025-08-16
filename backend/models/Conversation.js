// models/Conversation.js
const mongoose = require('mongoose');

// Define a estrutura para cada mensagem dentro da conversa
const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'model'], // O papel pode ser 'user' (usuário) ou 'model' (IA)
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Define a estrutura principal da conversa
const ConversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true, // Adiciona um índice para buscar conversas por userId mais rápido
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  messages: [MessageSchema], // Um array de mensagens, seguindo o schema definido acima
});

module.exports = mongoose.model('Conversation', ConversationSchema);


