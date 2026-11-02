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
const lugarRoutes = require('./routes/lugar.routes');
const destinosRouter = require('./routes/destino.routes');
const prestadorRoutes = require('./routes/prestador.routes'); 
const eventoRoutes = require('./routes/evento.routes'); // 👈 NUEVO: Enrutador de Eventos importado

app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/lugares', lugarRoutes);
app.use('/api/destinos', destinosRouter);
app.use('/api/prestadores', prestadorRoutes); 
app.use('/api/eventos', eventoRoutes); // 👈 NUEVO: Enrutador de Eventos asignado al endpoint base

app.use("/images", express.static("images"));

// Endpoint de verificación
app.get('/api/health', (req, res) => {
  res.json({ estado: 'OK', timestamp: new Date() });
});

// Inicio del Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[SERVER] Escuchando en el puerto http://localhost:${PORT}`);
});