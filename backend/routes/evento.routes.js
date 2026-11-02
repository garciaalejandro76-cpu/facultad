const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/evento.controller');
const upload = require("../config/multer"); // 👈 NUEVO: Middleware de Multer

router.get('/', eventoController.obtenerEventos);
router.post('/', upload.single("imagen"), eventoController.crearEvento); // 👈 NUEVO: upload agregado
router.put('/:id', upload.single("imagen"), eventoController.actualizarEvento); // 👈 NUEVO: upload agregado
router.delete('/:id', eventoController.eliminarEvento);

module.exports = router;