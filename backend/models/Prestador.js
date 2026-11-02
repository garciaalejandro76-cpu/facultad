const mongoose = require('mongoose');

const prestadorSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título del prestador es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria (Ej. Gastronomía, Hotel, Guía)'],
    trim: true
  },
  // Relación con el Usuario creador (id_usuario)
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario creador es obligatorio']
  },
  // Relación con la Zona correspondiente (id_zona)
  zona: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zona',
    required: [true, 'La zona de operación es obligatoria']
  },  
  imagen: {
    type: String,   
    trim: true
    // No se requiere de forma estricta para evitar bloqueos en el método PUT sin re-subida de archivo
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prestador', prestadorSchema, 'prestadores');