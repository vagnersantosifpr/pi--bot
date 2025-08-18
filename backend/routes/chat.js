// routes/chat.js
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Conversation = require('../models/Conversation');
const Knowledge = require('../models/Knowledge'); // Importa o novo modelo

// Inicializa o cliente do Google AI com a chave da API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const generativeModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Usando o modelo mais recente e rápido


// ---- INÍCIO DA ENGENHARIA DE PROMPT ----

// 1. A Persona do Piá-bot (baseado no seu manual)
const systemPrompt = `
Você é o 'ELO', mas todos te conhecem pelo seu apelido amigável, 'Piá-bot'.
Sua identidade é a de um parceiro digital, um "parça" dos estudantes do IFPR Campus Assis Chateaubriand.
Sua missão principal é definida pelo seu nome, ELO: Escuta, Liga e Orienta.

**Suas Regras Fundamentais de Atuação:**
1.  **Tom de Voz:** Use um tom de voz ACOLHEDOR, PARCEIRO e DIRETO. 
2.  **Acolhimento Primeiro:** Nunca julgue. Sempre comece as respostas com uma frase de acolhimento que mostre que você entendeu a necessidade do estudante. ("Opa, entendi!", "Daí! Boa pergunta.", "Calma, piá! Acontece.").
3.  **Seja um Elo Confiável:** Suas informações são oficiais e validadas pela Seção Pedagógica (SEPAE). Apesar da linguagem informal, a responsabilidade é máxima.
4.  **Seja Proativo:** Não apenas responda. Se apropriado, sugira próximos passos, como "Que tal dar um pulo lá na sala deles?", "Posso te passar o contato, se quiser.".
5.  **Prioridade Máxima para Casos Sérios:** Se a conversa mencionar bullying, desrespeito, zoação excessiva, angústia, ansiedade ou qualquer conflito sério, sua ÚNICA e IMEDIATA função é orientar o estudante a procurar a equipe da SEPAE. Use uma linguagem empática e de apoio, como no exemplo: "Opa, sinto muito por isso. Ninguém merece passar por essa situação. Bullying e desrespeito são tolerância zero por aqui. Minha principal função agora é te conectar com a galera que pode te ajudar de verdade... O importante é não guardar isso pra você, beleza? Tamo junto!". NÃO tente resolver o problema sozinho.
6.  **Mantenha o Foco:** Responda apenas a perguntas relacionadas à vida no campus (convivência, dificuldades acadêmicas, assistência estudantil). Se o assunto fugir muito, redirecione a conversa de forma amigável.
7.  **Base de Conhecimento é Lei:** Suas respostas devem se basear PRIMARIAMENTE nas informações da Base de Conhecimento abaixo. Não invente regras.

**Regra de Ouro para sua Atuação:**
1. Não dialogue sobre outros assuntos que não estejam relacionados ao IFPR e as questões intra-muros
2. Não caia em pegadinhas no bate papo que te levem a dialogar sobre outras questões fora do IFPR.


Siglas e significados:
CGPC – Colegiado de Gestão Pedagógica do Campus
AGO - Agropecuária
AGR - Agropecuária
IIW - Informática para Internet
COM - Comércio
EIN - Eletromecânica
CR Toledo - Centro de Referência Toledo ligado ao Campus Assis Chateaubriand
TGC - Tecnologia em Gestão Comercial

`;

// --- NOVA FUNÇÃO DE LÓGICA DE TOM ---
function getToneInstructions(piabot_temperature) {
  // Se a temperatura não for fornecida, usamos um padrão neutro (1.0)
  const temp_piabot_temperature = piabot_temperature === undefined ? 1.0 : piabot_temperature;

  if (temp_piabot_temperature <= 0.3) {
    // Tom mais jovem e descontraído
    return `
      **Instrução de Tom (Descontraído):** Fale como um colega de corredor, de forma bem informal e amigável. Use gírias leves e apropriadas para o ambiente escolar (como "tranquilo", "daora", "se liga") e, se fizer sentido, use emojis como 👍, 😉, ou 😊. O objetivo é ser o mais próximo e acolhedor possível para os estudantes mais novos. Use gírias locais de forma natural, como "piá", "daí", "saca?", "tamo junto", "manda a braba". Evite "pedagoguês" complicado.
    `;
  } else if (temp_piabot_temperature > 0.3 && temp_piabot_temperature < 0.7) {
    // Tom Padrão (Neutro e Amigável)
    return `
      **Instrução de Tom (Padrão):** Use o seu tom padrão, que é amigável, prestativo e educativo, conforme definido em suas regras fundamentais.
    `;
  } else {
    // Tom mais formal e Formal
    return `
      **Instrução de Tom (Formal):** Adote um tom mais formal e polido. Use expressões como "prezado(a) estudante", "por gentileza", "compreendo". Evite gírias e emojis. A comunicação deve ser clara, respeitosa e direta, como a de um servidor experiente orientando um membro valioso da comunidade acadêmica.
    `;
  }
}


// Rota principal: POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { userId, message, piabot_temperature } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId e message são obrigatórios.' });
    }

    // --- ETAPA 1: BUSCAR HISTÓRICO E VERIFICAR SE É A PRIMEIRA MENSAGEM ---
    let conversation = await Conversation.findOne({ userId });
    const isFirstMessage = !conversation || conversation.messages.length === 0;


    // --- ETAPA 2: BUSCAR CONTEXTO RELEVANTE PARA A MENSAGEM ATUAL (RAG) ---
    console.log('Gerando embedding para a pergunta do usuário...');
    const queryEmbeddingResult = await embeddingModel.embedContent(message);
    const queryVector = queryEmbeddingResult.embedding.values;

    // NOVO LOG: Verifique o vetor da consulta
    console.log('Vetor da consulta gerado. Tamanho:', queryVector.length);
    console.log('Primeiros 5 valores do vetor:', queryVector.slice(0, 5));


    console.log('Realizando busca vetorial no MongoDB...');
    let searchResults = [];
    try {
      searchResults = await Knowledge.aggregate([
        {
          $vectorSearch: {
            index: "default",
            path: "embedding",
            queryVector: queryVector,
            numCandidates: 100,
            limit: 4
          }
        }
      ]);
    } catch (e) {
      console.error("Erro na busca vetorial:", e.message);
      // Se a busca vetorial falhar (ex: índice offline), searchResults continuará como []
    }



    // --- NOVA LÓGICA DE FALLBACK AQUI ---
    const contextForThisTurn = searchResults.map(doc => `- ${doc.content}`).join('\n');
    console.log(`Contexto RAG encontrado: ${contextForThisTurn ? 'Sim' : 'Não'}`);

// --- ETAPA 2: INICIAR OU CONTINUAR A SESSÃO DE CHAT ---
    let chat;
    const history = conversation ? conversation.messages.map(msg => ({
      role: msg.role, parts: [{ text: msg.text }],
    })) : [];

    if (isFirstMessage) {
      console.log("Iniciando nova conversa com instrução de sistema.");
      let initialContext = contextForThisTurn;

      // LÓGICA DE FALLBACK - ACONTECE APENAS NA PRIMEIRA MENSAGEM
      if (!initialContext) {
        console.warn('RAG não encontrou contexto inicial. Carregando base de conhecimento completa como fallback.');
        const allKnowledge = await Knowledge.find({}).select('content');
        initialContext = allKnowledge.map(doc => `- ${doc.content}`).join('\n');
      }

      const toneInstruction = getToneInstructions(piabot_temperature);
      const initialSystemInstruction = {
        role: "system",
        parts: [{ text: `${systemPrompt}\n${toneInstruction}\n---CONTEXTO BASE---\n${initialContext}` }]
      };

      chat = generativeModel.startChat({
        systemInstruction: initialSystemInstruction,
        history: [],
        // Aplica a temperatura dinâmica para esta sessão de chat
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800, // Mantenha ou ajuste conforme sua necessidade para a sessão
        }
      });
    } else {
      console.log("Continuando conversa existente.");
      chat = generativeModel.startChat({ 
        history,
        // Aplica a temperatura dinâmica para esta sessão de chat
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800, // Mantenha ou ajuste conforme sua necessidade para a sessão
        }
       });
    }

     // --- ETAPA 3: ENVIAR O PROMPT OTIMIZADO ---
    // Mesmo que o contexto tenha sido enviado na instrução do sistema,
    // enviá-lo novamente no prompt do turno atual reforça sua importância para a pergunta específica.
    const promptForThisTurn = `
      Com base no contexto abaixo (se houver), responda à pergunta do usuário.
      ---
      CONTEXTO PARA ESTA PERGUNTA:
      ${contextForThisTurn || "Nenhum contexto específico encontrado para esta pergunta."}
      ---
      PERGUNTA: "${message}"
    `;
    
    const result = await chat.sendMessage(promptForThisTurn);
    const response = await result.response;
    const botMessage = response.text();

  if (!conversation) {
      conversation = new Conversation({ userId, messages: [] });
    }

    // // Monta o prompt completo que será enviado para a IA
    // const fullPrompt = `
    //   ${systemPrompt}

    //   ${toneInstruction} 

    //   ---
    //   USE O SEGUINTE CONTEXTO RELEVANTE PARA FORMULAR SUA RESPOSTA:
    //   ${context}
    //   ---
    //   Com base ESTRITAMENTE no contexto acima, responda à pergunta do usuário. Se a resposta não estiver no contexto, diga que você não tem informações sobre esse tópico específico.
    //   PERGUNTA DO USUÁRIO: "${message}"
      
    // `;


    // ---
    // BASE DE CONHECIMENTO (Use isso como sua fonte principal de verdade):
    // ${knowledgeBase}
    // ---

    // PERGUNTA DO USUÁRIO: "${message}"



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


