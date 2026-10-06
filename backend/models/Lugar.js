const mongoose = require('mongoose');

// Definimos el esquema o la estructura que tendrán los documentos en Mongo DB
const lugarSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del campo es obligatorio'],
        trim: true
    },
    descripcion: {
        type: String,
        required: [true, 'El nombre del campo es obligatorio'],
        trim: true
    },
    ubicacion: {
        type: String,
        required: [true, 'El nombre del campo es obligatorio'],
        trim: true
    },
    horario: {
        type: String,
        required: [true, 'El nombre del campo es obligatorio'],
        trim: true
    },
    imagen: {
        type: String,
        required: [true, 'El nombre del campo es obligatorio'],
        trim: true
    }
}, {
    // Genera automaticamente los campos de createdAt y updateAt (fechas)
    timestamps: true
});

// Ecportamos el modelo para usarlo en los controladores
module.exports = mongoose.model('Lugar', lugarSchema, 'lugares');