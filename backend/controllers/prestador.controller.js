const Prestador = require('../models/Prestador');
const Usuario = require('../models/Usuario'); // 👈 NUEVO: Requerir modelo de usuario


// GET: Obtener prestadores (Soporta filtros opcionales de zona o destino de forma anidada)
exports.obtenerPrestadores = async (req, res) => {
  try {
    const query = {};
    
    // Si envían una zona directa desde el frontend, filtramos por ella
    if (req.query.zona) {
      query.zona = req.query.zona;
    }

    // Buscamos los prestadores y populamos sus relaciones jerárquicas
    let prestadores = await Prestador.find(query)
      .populate({
        path: 'zona',
        populate: { path: 'destino' } // Trae el objeto destino dentro de la zona
      })
      .populate('usuario', 'nombre correo');

    // Si filtraron por un Destino principal desde la cabecera global, limpiamos en memoria
    if (req.query.destino && !req.query.zona) {
      prestadores = prestadores.filter(p => p.zona && p.zona.destino && p.zona.destino._id.toString() === req.query.destino);
    }

    res.status(200).json({ ok: true, datos: prestadores });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener prestadores', error: error.message });
  }
};

// POST: Crear un nuevo prestador
exports.crearPrestador = async (req, res) => {
  try {
    const { titulo, descripcion, categoria, zona, usuario } = req.body;

    if (!titulo || !zona || !usuario) {
      return res.status(400).json({ ok: false, mensaje: 'Título, Zona, Usuario son obligatorios' });
    }

    // 🔽 NUEVO: Validación de rol administrativa en la API
    const datosUsuario = await Usuario.findById(usuario);
    if (!datosUsuario || datosUsuario.rol !== 'admin') {
      return res.status(403).json({ ok: false, mensaje: 'Acceso denegado: Se requieren permisos de administrador' });
    }

    const nuevoPrestador = new Prestador({
      titulo, descripcion, categoria, zona, usuario,     
      imagen: req.file ? req.file.filename : null
    });

    const prestadorGuardado = await nuevoPrestador.save();
    res.status(201).json({ ok: true, mensaje: 'Prestador guardado exitosamente', datos: prestadorGuardado });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al guardar el prestador', error: error.message });
  }
};

// PUT: Actualizar un prestador existente
exports.actualizarPrestador = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, categoria, zona, usuarioActual } = req.body;

    // 🔽 NUEVO: Validación de rol de edición en la API
    if (usuarioActual) {
      const datosUsuario = await Usuario.findById(usuarioActual);
      if (!datosUsuario || datosUsuario.rol !== 'admin') {
        return res.status(403).json({ ok: false, mensaje: 'No tienes permisos para modificar prestadores' });
      }
    }

    const camposAActualizar = { titulo, descripcion, categoria, zona };
    if (req.file) camposAActualizar.imagen = req.file.filename;

    const prestadorActualizado = await Prestador.findByIdAndUpdate(id, camposAActualizar, { new: true });
    if (!prestadorActualizado) return res.status(404).json({ ok: false, mensaje: 'Prestador no encontrado' });

    res.status(200).json({ ok: true, mensaje: 'Prestador actualizado correctamente', datos: prestadorActualizado });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar el prestador', error: error.message });
  }
};

// DELETE: Eliminar un prestador de servicios
exports.eliminarPrestador = async (req, res) => {
  try {
    const { id } = req.params;
    const prestadorEliminado = await Prestador.findByIdAndDelete(id);
    if (!prestadorEliminado) return res.status(404).json({ ok: false, mensaje: 'Prestador no encontrado' });
    res.status(200).json({ ok: true, mensaje: 'Prestador eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar el prestador', error: error.message });
  }
};