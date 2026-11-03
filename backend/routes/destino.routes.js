const express = require('express');
const router = express.Router();
const destinoController = require('../controllers/destino.controller');

// GET: Obtener el listado de destinos
router.get('/', destinoController.obtenerDestinos); 

// POST: Registrar un nuevo destino con sus respectivas zonas
router.post('/', destinoController.crearDestino);

// PUT: Modificar los metadatos de un destino y sus zonas asociadas
router.put('/:id', destinoController.actualizarDestino);

// DELETE: Remover de forma permanente un destino y sus subdocumentos en cascada
router.delete('/:id', destinoController.eliminarDestino);

module.exports = router;