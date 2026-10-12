const express = require('express');
const router = express.Router();

// Importar el controlador con las funciones de métodos
const lugarController = require('../controllers/lugar.controller');
const upload = require("../config/multer");

// Definir las rutas con los endpoints mapeados con los métodos HTTP correspondientes
router.get('/', lugarController.obtenerLugares); // método GET - obtener productos

// MODO CREACIÓN: Procesa el FormData y la imagen
router.post("/", upload.single("imagen"), lugarController.crearLugar);

// MODO ACTUALIZACIÓN: ¡CORREGIDO! Ahora también procesa el FormData y la imagen si viene una nueva
router.put('/:id', upload.single("imagen"), lugarController.actualizarLugar); 

router.delete('/:id', lugarController.eliminarLugar); // método DELETE - eliminar un producto

module.exports = router;