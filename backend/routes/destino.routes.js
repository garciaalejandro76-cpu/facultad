const express = require('express');
const router = express.Router();

const destinoController = require('../controllers/destino.controller');
// Reutilizamos tu configuración de Multer para interceptar el FormData
const upload = require("../config/multer");

// Definición de endpoints mapeados
router.get('/', destinoController.obtenerDestinos);

// upload.none() le dice a Multer que procese el FormData que no contiene imágenes/archivos
router.post("/", upload.none(), destinoController.crearDestino);
router.put('/:id', upload.none(), destinoController.actualizarDestino); 

router.delete('/:id', destinoController.eliminarDestino);

module.exports = router;