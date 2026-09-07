const express = require('express');
const cors = require('cors');
require('dotenv').config();
const conectarDB = require('./config/db');
const app = express();
// Conectar a la Base de Datos MongoDB Atlas
conectarDB();
// Middlewares
app.use(cors());
app.use(express.json());
// Enrutadores
const productoRoutes = require('./routes/producto.routes');
const usuarioRoutes = require('./routes/usuario.routes');
app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
// Endpoint de verificación
app.get('/api/health', (req, res) => {
 res.json({ estado: 'OK', timestamp: new Date() });
});
// Inicio del Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
 console.log(`[SERVER] Escuchando en el puerto http://localhost:${PORT}`);
});