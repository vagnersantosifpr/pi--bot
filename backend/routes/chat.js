// routes/chat.js
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Conversation = require('../models/Conversation');

// Inicializa o cliente do Google AI com a chave da API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"}); // Usando o modelo mais recente e rápido

// ---- INÍCIO DA ENGENHARIA DE PROMPT ----

// 1. A Persona do AssisBot
const systemPrompt = `
Você é o "AssisBot", um chatbot amigável e prestativo criado para ser o assistente de convivência do IFPR Campus Assis Chateaubriand.
Sua missão é orientar os estudantes sobre as regras e boas práticas de convivência, sempre de forma acolhedora, positiva e educativa.
**Suas Regras Fundamentais:**
1.  **Seja Amigável e Empático:** Use uma linguagem informal e próxima dos estudantes. Comece as conversas de forma positiva.
2.  **Baseie-se na Base de Conhecimento:** Suas respostas DEvem se basear PRIMARIAMENTE nas informações fornecidas na "Base de Conhecimento". Não invente regras.
3.  **Seja um Mediador, Não um Juiz:** Seu papel é orientar e sugerir soluções pacíficas. Evite tomar partido ou usar linguagem punitiva.
4.  **Mantenha o Foco:** Responda apenas a perguntas relacionadas à convivência no campus (barulho, namoro, uso de espaços, etc.). Se o usuário perguntar sobre outros assuntos (notas, outras matérias, política, etc.), educadamente redirecione o foco para os temas de convivência.
5.  **Respostas Curtas e Diretas:** Forneça respostas claras e objetivas, de preferência em parágrafos curtos ou listas.
6.  **Segurança em Primeiro Lugar:** Se a pergunta envolver qualquer forma de assédio, bullying, violência ou algo que ameace a segurança, sua ÚNICA resposta deve ser orientar o estudante a procurar imediatamente um adulto responsável no campus, como a equipe pedagógica ou a direção. Não tente resolver esses problemas sozinho.
`;

// 2. A Base de Conhecimento (Informações que o bot deve saber)
const knowledgeBase = `
**TEMA: Namoro no Campus**
- É permitido namorar nos espaços de convivência do IFPR, como pátios e corredores.
- Demonstrações de afeto são aceitáveis, desde que não sejam excessivas e respeitem o ambiente escolar, que é um local público e de estudo.
- Caso o comportamento de um casal seja considerado inadequado, um servidor do campus poderá orientá-los a manter a discrição. O objetivo é o bom senso e o respeito mútuo.

**TEMA: Barulho Excessivo**
- Nos corredores e salas de aula, o silêncio é fundamental para não atrapalhar as aulas e os estudos.
- Nos pátios e áreas de convivência, conversas em tom normal são permitidas.
- Caixas de som e música alta são proibidas, exceto em eventos autorizados pela direção. O uso de fones de ouvido é a melhor opção para ouvir música individualmente.

**TEMA: Uso de Celulares**
- O uso de celulares em sala de aula só é permitido com a autorização expressa do professor para atividades pedagógicas.
- Fora da sala de aula, o uso é livre, mas sempre com bom senso para não atrapalhar os outros.
`;

// ---- FIM DA ENGENHARIA DE PROMPT ----

// Rota principal: POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { userId, message } = req.body;

    // Validação da entrada
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId e message são obrigatórios.' });
    }

    // Busca a conversa no banco ou cria uma nova se não existir
    let conversation = await Conversation.findOne({ userId });
    if (!conversation) {
      conversation = new Conversation({ userId, messages: [] });
    }

    // Prepara o histórico da conversa para a IA
    const history = conversation.messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    // Inicia a sessão de chat com o histórico
    const chat = model.startChat({
        history: history,
        generationConfig: {
            maxOutputTokens: 500, // Limita o tamanho da resposta
        },
    });

    // Monta o prompt completo que será enviado para a IA
    const fullPrompt = `
      ${systemPrompt}

      ---
      BASE DE CONHECIMENTO (Use isso como sua fonte principal de verdade):
      ${knowledgeBase}
      ---

      PERGUNTA DO USUÁRIO: "${message}"
    `;

    // Envia a mensagem para a IA e aguarda a resposta
    const result = await chat.sendMessage(fullPrompt);
    const response = await result.response;
    const botMessage = response.text();

    // Salva a pergunta do usuário e a resposta do bot no nosso banco de dados
    conversation.messages.push({ role: 'user', text: message });
    conversation.messages.push({ role: 'model', text: botMessage });
    await conversation.save();

    // Envia a resposta do bot de volta para o frontend
    res.json({ reply: botMessage });

  } catch (error) {
    console.error('Erro no endpoint do chat:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao processar sua mensagem.' });
  }
});

module.exports = router;