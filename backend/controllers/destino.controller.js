const Destino = require('../models/Destino');
const Zona = require('../models/Zona');

// GET: Obtener todos los destinos poblando sus zonas
exports.obtenerDestinos = async (req, res) => {
  try {
    const destinos = await Destino.find().populate('zonas');
    res.status(200).json({ ok: true, datos: destinos });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener destinos', error: error.message });
  }
};

// POST: Crear un nuevo destino guardando y asociando sus zonas iniciales
exports.crearDestino = async (req, res) => {
  try {
    const { nombre, descripcion, administrador, zonas } = req.body;

    if (!nombre || !descripcion || !administrador) {
      return res.status(400).json({ ok: false, mensaje: 'El nombre, descripción y administrador son obligatorios' });
    }

    const nuevoDestino = new Destino({
      nombre,
      descripcion,
      administrador,
      zonas: []
    });

    const destinoGuardado = await nuevoDestino.save();

    const zonasArray = Array.isArray(zonas) ? zonas : [];
    const idsZonasCreadas = [];

    for (const z of zonasArray) {
      if (z.nombre && z.nombre.trim() !== "") {
        const nuevaZonaDoc = new Zona({
          nombre: z.nombre.trim(),
          destino: destinoGuardado._id
        });
        const zonaGuardada = await nuevaZonaDoc.save();
        idsZonasCreadas.push(zonaGuardada._id);
      }
    }

    destinoGuardado.zonas = idsZonasCreadas;
    await destinoGuardado.save();

    const destinoFinal = await Destino.findById(destinoGuardado._id).populate('zonas');
    res.status(201).json({ ok: true, mensaje: 'Destino y zonas registrados con éxito', datos: destinoFinal });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al crear el destino', error: error.message });
  }
};

// PUT: Modificar un destino y sincronizar el estado de sus zonas
exports.actualizarDestino = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, administrador, zonas } = req.body;

    const zonasArray = Array.isArray(zonas) ? zonas : [];
    const idsZonasFinales = [];

    for (const z of zonasArray) {
      if (z._id) {
        await Zona.findByIdAndUpdate(z._id, { nombre: z.nombre });
        idsZonasFinales.push(z._id);
      } else {
        const nuevaZonaDoc = new Zona({
          nombre: z.nombre,
          destino: id
        });
        const zonaGuardada = await nuevaZonaDoc.save();
        idsZonasFinales.push(zonaGuardada._id);
      }
    }

    const destinoActualizado = await Destino.findByIdAndUpdate(
      id,
      { nombre, descripcion, administrador, zonas: idsZonasFinales },
      { new: true }
    ).populate('zonas');

    if (!destinoActualizado) {
      return res.status(404).json({ ok: false, mensaje: 'Destino no encontrado' });
    }

    res.status(200).json({ ok: true, mensaje: 'Destino y zonas actualizados correctamente', datos: destinoActualizado });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar el destino', error: error.message });
  }
};

// DELETE: Eliminar un destino y todas sus zonas vinculadas (En Cascada)
exports.eliminarDestino = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Buscamos y eliminamos el destino principal
    const destinoEliminado = await Destino.findByIdAndDelete(id);

    if (!destinoEliminado) {
      return res.status(404).json({ ok: false, mensaje: 'Destino no encontrado' });
    }

    // 2. 💡 ELIMINACIÓN EN CASCADA: Borramos todas las zonas que pertenezcan a este destino
    await Zona.deleteMany({ destino: id });

    res.status(200).json({ ok: true, mensaje: 'Destino y sus zonas asociadas se eliminaron correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar el destino', error: error.message });
  }
};