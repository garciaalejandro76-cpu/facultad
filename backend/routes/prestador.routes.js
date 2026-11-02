const express = require('express');
const router = express.Router();

// IMPORTACIÓN CORREGIDA: Apunta exactamente a tu archivo de controlador de prestadores
const prestadorController = require('../controllers/prestador.controller');
const upload = require("../config/multer");

// Definición de endpoints mapeados con sus funciones
router.get('/', prestadorController.obtenerPrestadores);
router.post('/', upload.single("imagen"), prestadorController.crearPrestador);
router.put('/:id', upload.single("imagen"), prestadorController.actualizarPrestador);
router.delete('/:id', prestadorController.eliminarPrestador);

module.exports = router;