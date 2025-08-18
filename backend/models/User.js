// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Não retorna a senha em buscas por padrão
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'viewer'], // 'admin' pode tudo, 'viewer' só visualiza
    default: 'viewer',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hook do Mongoose que executa ANTES de salvar o documento
UserSchema.pre('save', async function (next) {
  // Se a senha não foi modificada, não faz nada
  if (!this.isModified('password')) return next();

  // Gera o hash da senha com um "custo" de 10 (padrão de segurança)
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

// Método para comparar a senha enviada com a senha no banco
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

