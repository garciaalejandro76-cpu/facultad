const express = require('express');
const  router = express.Router();

// Importar el controlador con las funciones de métodos
const productoController = require('../controllers/producto.controller');

// Definir las rutas con los endpoints mapeados con los métodos HTTP correspondientes
router.get('/', productoController.obtenerProductos); // método GET - obtener productos
router.post('/', productoController.crearProducto); // método POST - crear un producto
router.put('/:id', productoController.actualizarProducto); // método PUT - actualizar un producto
router.delete('/:id', productoController.eliminarProducto); // método DELETE - eliminar un producto

module.exports = router;


