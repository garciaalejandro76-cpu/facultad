// 1. Importar librerías
const express = require('express');
const app = express();

// 2. Middlewares (para que el servidor entienda formato JSON)
app.use(express.json());

// 3. Ruta de prueba (Endpoint GET)
app.get('/', (req, res) => {
  res.json({
    mensaje: "¡API de Inventario Base Funcionando Correctamente!",
    estado: "OK"
  });
});

// 4. Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});