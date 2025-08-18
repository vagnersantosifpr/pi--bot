const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Conversation = require('../models/Conversation');
const Knowledge = require('../models/Knowledge');
const User = require('../models/User');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });


// Novo Middleware de Autenticação baseado em Token JWT
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso não autorizado: token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adiciona os dados do usuário (id, role) à requisição
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Acesso não autorizado: token inválido.' });
  }
};

// Middleware para verificar se o usuário é Admin
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Acesso negado: privilégios de administrador necessários.' });
    }
};


// APLICA O MIDDLEWARE A TODAS AS ROTAS DE ADMIN
router.use(authMiddleware);

// ... (Suas rotas de /conversations e /knowledge continuam aqui, sem o `auth` antigo)
// --- ROTAS PARA HISTÓRICO DE CONVERSAS ---
router.get('/conversations', async (req, res) => { // <-- VERIFIQUE ESTA FUNÇÃO
  try {
    const conversations = await Conversation.find({})
      .sort({ createdAt: -1 })
      .select('_id userId createdAt messages.0');
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar conversas.' });
  }
});

router.get('/conversations/:id', async (req, res) => { // <-- VERIFIQUE ESTA FUNÇÃO
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada.' });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar a conversa.' });
  }
});

// --- ROTAS PARA BASE DE CONHECIMENTO ---
router.get('/knowledge', async (req, res) => { // <-- VERIFIQUE ESTA FUNÇÃO
  try {
    const knowledgeItems = await Knowledge.find({}).select('-embedding');
    res.json(knowledgeItems);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar base de conhecimento.' });
  }
});

router.delete('/knowledge/:id', adminOnly, async (req, res) => {
  try {
    // 1. Pega o ID do item a ser deletado a partir dos parâmetros da URL.
    const { id } = req.params;

    // 2. Usa o Mongoose para encontrar o documento pelo ID e deletá-lo.
    const deletedItem = await Knowledge.findByIdAndDelete(id);

    // 3. Verifica se um item foi realmente encontrado e deletado.
    if (!deletedItem) {
      // Se findByIdAndDelete não encontra o documento, ele retorna null.
      return res.status(404).json({ error: 'Item de conhecimento não encontrado.' });
    }

    // 4. Se tudo deu certo, envia uma resposta de sucesso.
    res.status(200).json({ message: 'Item de conhecimento deletado com sucesso.' });

  } catch (error) {
    // 5. Se ocorrer qualquer erro inesperado (ex: erro de conexão com o DB), captura-o.
    console.error('Erro ao deletar item de conhecimento:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
});

router.post('/knowledge', adminOnly, async (req, res) => {
  try {
    const { source, topic, content } = req.body;
    if (!source || !topic || !content) {
      return res.status(400).json({ error: 'Todos os campos (source, topic, content) são obrigatórios.' });
    }

    // Gera o embedding para o novo conteúdo
    console.log(`Gerando embedding para o novo tópico: "${topic}"`);
    const result = await embeddingModel.embedContent(content);
    const embedding = result.embedding.values;

    // Cria o novo documento no banco de dados
    const newKnowledgeItem = await Knowledge.create({
      source,
      topic,
      content,
      embedding,
    });
    
    // Retorna o item criado (sem o vetor gigante do embedding) para o frontend
    const itemToReturn = newKnowledgeItem.toObject();
    delete itemToReturn.embedding;

    res.status(201).json(itemToReturn);
    
  } catch (error) {
    console.error('Erro ao adicionar item de conhecimento:', error);
    res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
  }
});

// --- NOVAS ROTAS PARA MANUTENÇÃO DE USUÁRIOS ---
// Apenas admins podem gerenciar usuários
router.get('/users', adminOnly, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
});

router.post('/users', adminOnly, async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        const newUser = new User({ email, password, name, role });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao criar usuário.', details: error.message });
    }
});

router.delete('/users/:id', adminOnly, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Usuário deletado.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar usuário.' });
    }
});

module.exports = router;