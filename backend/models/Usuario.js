const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. PRIMERO: Declaramos el esquema
const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un correo electrónico válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  rol: {
    type: String,
    enum: ['admin', 'empleado', 'cliente'],
    default: 'cliente'
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Genera createdAt y updatedAt automáticamente
});

// 2. SEGUNDO: Añadimos los hooks y métodos al esquema ya creado
// Encriptar contraseña automáticamente antes de guardar un usuario nuevo
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método personalizado para comparar contraseñas en el controlador de Login
usuarioSchema.methods.compararPassword = async function (passwordCandidata) {
  return await bcrypt.compare(passwordCandidata, this.password);
};

// 3. TERCERO: Exportamos el modelo basado en el esquema configurado
module.exports = mongoose.model('Usuario', usuarioSchema);