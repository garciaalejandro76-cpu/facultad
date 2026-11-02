const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título del evento es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  fecha_hora_inicio: {
    type: Date,
    required: [true, 'La fecha y hora de inicio son obligatorias']
  },
  fecha_hora_fin: {
    type: Date,
    required: [true, 'La fecha y hora de finalización son obligatorias']
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario creador es obligatorio']
  },
  zona: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zona',
    required: [true, 'La zona del evento es obligatoria']
  },
  imagen: { // 👈 NUEVO: Campo de imagen agregado
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Evento', eventoSchema, 'eventos');