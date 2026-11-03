const Evento = require('../models/Evento');
const Usuario = require('../models/Usuario'); // 👈 NUEVO: Requerir modelo de usuario


// GET: Obtener eventos filtrados por vigencia y ordenados cronológicamente
exports.obtenerEventos = async (req, res) => {
  try {
    const ahora = new Date();
    const { zona, destino, tiempo } = req.query;
    
    let query = {};

    // 1. Filtro temporal dinámico según la petición del cliente
    if (tiempo === 'pasados') {
      query.fecha_hora_fin = { $lt: ahora }; // Eventos que ya finalizaron
    } else {
      query.fecha_hora_fin = { $gte: ahora }; // Eventos activos o futuros (por defecto)
    }
    
    // Filtro por zona si viene en los query params
    if (zona) {
      query.zona = zona;
    }

    // 2. Buscamos y ordenamos:
    // Si son futuros, el más cercano primero (1). Si son pasados, el más reciente primero (-1).
    const ordenCronologico = tiempo === 'pasados' ? -1 : 1;

    let eventos = await Evento.find(query)
      .populate({
        path: 'zona',
        populate: { path: 'destino' }
      })
      .populate('usuario', 'nombre correo')
      .sort({ fecha_hora_inicio: ordenCronologico });

    // Filtrar por destino principal en memoria si se requiere
    if (destino && !zona) {
      eventos = eventos.filter(e => e.zona && e.zona.destino && e.zona.destino._id.toString() === destino);
    }

    res.status(200).json({ ok: true, datos: eventos });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener eventos', error: error.message });
  }
};
//--------------------------------------

// POST: Crear un nuevo evento
exports.crearEvento = async (req, res) => {
  try {
    const { titulo, descripcion, fecha_hora_inicio, fecha_hora_fin, zona, usuario } = req.body;

    if (!titulo || !fecha_hora_inicio || !fecha_hora_fin || !zona || !usuario) {
      return res.status(400).json({ ok: false, mensaje: 'Campos obligatorios incompletos' });
    }

    // 🔽 NUEVO: Control de rol estricto en el servidor
    const datosUsuario = await Usuario.findById(usuario);
    if (!datosUsuario || datosUsuario.rol !== 'admin') {
      return res.status(403).json({ ok: false, mensaje: 'Acceso denegado: Se requieren permisos de administrador' });
    }

    if (new Date(fecha_hora_inicio) >= new Date(fecha_hora_fin)) {
      return res.status(400).json({ ok: false, mensaje: 'La fecha de inicio no puede ser posterior o igual a la de finalización' });
    }

    const nuevoEvento = new Evento({
      titulo, descripcion, fecha_hora_inicio, fecha_hora_fin, zona, usuario,
      imagen: req.file ? req.file.filename : null
    });

    const eventoGuardado = await nuevoEvento.save();
    res.status(201).json({ ok: true, mensaje: 'Evento guardado exitosamente', datos: eventoGuardado });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al guardar el evento', error: error.message });
  }
};

// PUT: Actualizar un evento existente
exports.actualizarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha_hora_inicio, fecha_hora_fin, zona, usuarioActual } = req.body; // 👈 Captura el autor de la edición

    // 🔽 NUEVO: Protección estricta del PUT
    if (usuarioActual) {
      const datosUsuario = await Usuario.findById(usuarioActual);
      if (!datosUsuario || datosUsuario.rol !== 'admin') {
        return res.status(403).json({ ok: false, mensaje: 'No tienes permisos para modificar eventos' });
      }
    }

    if (fecha_hora_inicio && fecha_hora_fin && new Date(fecha_hora_inicio) >= new Date(fecha_hora_fin)) {
      return res.status(400).json({ ok: false, mensaje: 'La fecha de inicio no puede ser posterior o igual a la de finalización' });
    }

    const camposAActualizar = { titulo, descripcion, fecha_hora_inicio, fecha_hora_fin, zona };
    if (req.file) camposAActualizar.imagen = req.file.filename;

    const eventoActualizado = await Evento.findByIdAndUpdate(id, camposAActualizar, { new: true });
    if (!eventoActualizado) return res.status(404).json({ ok: false, mensaje: 'Evento no encontrado' });

    res.status(200).json({ ok: true, mensaje: 'Evento actualizado correctamente', datos: eventoActualizado });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar el evento', error: error.message });
  }
};

// DELETE: Eliminar un evento (Queda igual)
exports.eliminarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const eventoEliminado = await Evento.findByIdAndDelete(id);
    if (!eventoEliminado) return res.status(404).json({ ok: false, mensaje: 'Evento no encontrado' });
    res.status(200).json({ ok: true, mensaje: 'Evento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar el evento', error: error.message });
  }
};