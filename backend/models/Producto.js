const mongoose = require('mongoose');

// Definimos la estructura (esquema) que tendrán los documentos en MongoDB
const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true // Elimina espacios en blanco al inicio y final
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: {
    type: Number,
    default: 0
  }
}, {
  // Genera automáticamente los campos createdAt y updatedAt
  timestamps: true 
});

// Exportamos el modelo para usarlo en los controladores
module.exports = mongoose.model('Producto', productoSchema);