const mongoose = require('mongoose');

const destinoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del destino es obligatorio'],
        trim: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true
    },
    administrador: {
        type: String,
        required: [true, 'El administrador es obligatorio'],
        trim: true
    },
    // Ahora almacena referencias a los ObjectIds de las zonas
    zonas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Zona'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Destino', destinoSchema, 'destinos');