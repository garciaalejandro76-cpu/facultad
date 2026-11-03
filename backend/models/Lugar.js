const mongoose = require('mongoose');

const lugarSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  destino: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destino',
    required: [true, 'El destino es obligatorio']
  },
  zona: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zona',
    required: [true, 'La zona es obligatoria']
  },
  horario: {
    type: String,
    trim: true
  },
  imagen: {
    type: String,
    trim: true
  },
  // 👈 AGREGA ESTE BLOQUE AQUÍ:
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario creador es obligatorio']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lugar', lugarSchema, 'lugares');