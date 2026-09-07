const mongoose = require('mongoose');
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
module.exports = mongoose.model('Usuario', usuarioSchema);