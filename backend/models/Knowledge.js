// server/models/Knowledge.js
const mongoose = require('mongoose');

const KnowledgeSchema = new mongoose.Schema({
  source: { type: String, required: true },
  topic: { type: String, required: true },
  content: { type: String, required: true },
  embedding: { type: [Number], required: true },
});

module.exports = mongoose.model('Knowledge', KnowledgeSchema);

