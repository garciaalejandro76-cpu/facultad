const express = require('express');
const  router = express.Router();

// Importar el controlador con las funciones de métodos
const lugarController = require('../controllers/lugar.controller');

// Definir las rutas con los endpoints mapeados con los métodos HTTP correspondientes
router.get('/', lugarController.obtenerLugares); // método GET - obtener productos
router.post('/', lugarController.crearLugar); // método POST - crear un producto
router.put('/:id', lugarController.actualizarLugar); // método PUT - actualizar un producto
router.delete('/:id', lugarController.eliminarLugar); // método DELETE - eliminar un producto

module.exports = router;