// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ---- ADICIONE ESTAS LINHAS ----
// Define um prefixo para todas as rotas de chat
app.use('/api/chat', require('./routes/chat'));
// ---------------------------------

app.get('/', (req, res) => {
  res.send('Servidor AssisBot está online e pronto para conversar!');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});