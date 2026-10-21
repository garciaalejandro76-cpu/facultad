const mongoose = require('mongoose');

const zonaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la zona es obligatorio'],
        trim: true
    },
    destino: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destino',
        required: [true, 'La zona debe estar asociada a un destino']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Zona', zonaSchema, 'zonas');