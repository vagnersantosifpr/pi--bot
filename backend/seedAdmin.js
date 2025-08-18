// server/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seedAdminUser() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado.');

    const adminEmail = process.env.ADMIN_EMAIL;

    // 1. Verifica se o usuário admin já existe
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Usuário admin já existe. Nenhuma ação necessária.');
      return;
    }

    // 2. Cria o novo usuário admin
    console.log('Criando usuário admin...');
    const adminUser = new User({
      email: adminEmail,
      password: process.env.ADMIN_INITIAL_PASSWORD,
      name: 'Administrador Piá-bot',
      role: 'admin',
    });

    await adminUser.save(); // O hook 'pre-save' irá criptografar a senha automaticamente
    console.log('Usuário admin criado com sucesso!');

  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB.');
  }
}

seedAdminUser();

