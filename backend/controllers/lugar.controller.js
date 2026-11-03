const Lugar = require('../models/Lugar');
const Usuario = require('../models/Usuario'); // 👈 NUEVO: Importar el modelo de usuario para chequear el rol


// GET: Obtener lugares (soporta filtros opcionales de destino y zona vía Query Params)
exports.obtenerLugares = async (req, res) => {
  try {
    const query = {};
    
    // Si vienen los filtros desde el frontend, los aplicamos a la búsqueda
    if (req.query.destino) query.destino = req.query.destino;
    if (req.query.zona) query.zona = req.query.zona;

    // Se agrega el populate de usuario trayendo solo nombre y correo por seguridad
    const lugares = await Lugar.find(query)
      .populate('destino')
      .populate('zona')
      .populate('usuario', 'nombre correo'); // 👈 NUEVO: Relación de auditoría expuesta

    res.status(200).json({ ok: true, datos: lugares });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener los lugares', error: error.message });
  }
};

// POST: Crear un nuevo lugar
exports.crearLugar = async (req, res) => {
  try {
    const { nombre, descripcion, destino, zona, horario, usuario } = req.body;

    if (!nombre || !destino || !zona || !usuario) {
      return res.status(400).json({ ok: false, mensaje: 'Nombre, Destino, Zona y Usuario son campos obligatorios' });
    }

    // 🔽 NUEVO: Control de rol en el servidor
    const datosUsuario = await Usuario.findById(usuario);
    if (!datosUsuario || datosUsuario.role !== 'admin') { // o datosUsuario.rol según tu BD
      return res.status(403).json({ ok: false, mensaje: 'Acceso denegado: Se requieren permisos de administrador' });
    }

    const nuevoLugar = new Lugar({
         nombre, descripcion, destino, zona, usuario, horario,
         imagen: req.file ? req.file.filename : null
    });
   
    const lugarGuardado = await nuevoLugar.save();
    res.status(201).json({ ok: true, mensaje: 'Lugar guardado exitosamente', datos: lugarGuardado });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al guardar el lugar', error: error.message });
  }
};

// PUT: Actualizar un lugar existente
exports.actualizarLugar = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioActual } = req.body; // 👈 Asegúrate de pasar el ID del usuario en el formData desde el cliente si es necesario proteger el PUT

    // Opcional: Si quieres proteger estrictamente el PUT desde Postman, repite la validación:
    if (usuarioActual) {
      const datosUsuario = await Usuario.findById(usuarioActual);
      if (!datosUsuario || datosUsuario.rol !== 'admin') {
        return res.status(403).json({ ok: false, mensaje: 'No tienes permisos para modificar registros' });
      }
    }

    const camposAActualizar = { ...req.body };
    if (req.file) camposAActualizar.imagen = req.file.filename;
 
    const lugarActualizado = await Lugar.findByIdAndUpdate(id, camposAActualizar, { new: true });
    if (!lugarActualizado) return res.status(404).json({ ok: false, mensaje: 'Lugar no encontrado' }); 

    res.status(200).json({ ok: true, mensaje: 'Lugar actualizado correctamente', datos: lugarActualizado });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar el lugar', error: error.message });
  }
};

// DELETE: Eliminar un lugar de servicios
exports.eliminarLugar = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Nota: Para proteger el DELETE por completo, el método óptimo a futuro será implementar 
    // un Middleware de autenticación por Token JWT en el archivo de rutas.

    const lugarEliminado = await Lugar.findByIdAndDelete(id);
    if (!lugarEliminado) return res.status(404).json({ ok: false, mensaje: 'Lugar no encontrado' });
    res.status(200).json({ ok: true, mensaje: 'Lugar eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar el lugar', error: error.message });
  }
};