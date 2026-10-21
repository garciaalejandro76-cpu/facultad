const mongoose = require('mongoose');

const lugarSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true
    },
    // Relación con el Destino elegido
    destino: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destino',
        required: [true, 'El destino es obligatorio']
    },
    // Relación con la Zona perteneciente a ese destino
    zona: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Zona',
        required: [true, 'La zona es obligatoria']
    },
    horario: {
        type: String,
        required: [true, 'El horario es obligatorio'],
        trim: true
    },
    imagen: {
        type: String,
        required: [true, 'La imagen es obligatoria'],
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Lugar', lugarSchema, 'lugares');