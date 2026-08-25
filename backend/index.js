const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Carga las variables del archivo .env

const conectarDB = require('./config/db'); // Importamos la función de conexión

const app = express();

// Conectar a la Base de Datos MongoDB Atlas
conectarDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const productoRoutes = require('./routes/producto.routes');
app.use('/api/productos', productoRoutes);

// Ruta de estado
app.get('/api/health', (req, res) => {
  res.json({ estado: 'OK', timestamp: new Date() });
});

// Inicialización del Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[SERVER] Escuchando en el puerto http://localhost:${PORT}`);
});