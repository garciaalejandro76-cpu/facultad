const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    console.log('[DATABASE] Intentando conectar a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[DATABASE] Conectado exitosamente a MongoDB Atlas');
  } catch (error) {
    console.error('[DATABASE ERROR] Fallo al conectar a la base de datos:', error.message);
    process.exit(1);
  }
};

module.exports = conectarDB;