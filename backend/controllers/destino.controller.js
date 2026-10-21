const Destino = require('../models/Destino');
const Zona = require('../models/Zona');

// GET: Obtener todos los destinos con sus zonas completas
exports.obtenerDestinos = async (req, res) => {
  try {
    // .populate('zonas') trae la información completa de la otra colección
    const destinos = await Destino.find().populate('zonas');
    res.status(200).json({ ok: true, datos: destinos });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener los destinos' });
  }
};

// POST: Crear un nuevo destino y sus respectivas zonas hijas
exports.crearDestino = async (req, res) => {
  try {
    const { nombre, descripcion, administrador, zonas } = req.body;

    if (!nombre) {
      return res.status(400).json({ ok: false, mensaje: 'El nombre es obligatorio' });
    }

    // 1. Creamos y guardamos el destino base vacío de zonas
    const nuevoDestino = new Destino({ nombre, descripcion, administrador, zonas: [] });
    const destinoGuardado = await nuevoDestino.save();

    // 2. Procesamos el arreglo de nombres de zonas enviado desde el Front
    let zonasArray = [];
    if (zonas) {
      try { zonasArray = JSON.parse(zonas); } catch (e) { zonasArray = []; }
    }

    // 3. Guardamos cada zona individualmente en su colección asociándole el ID del destino
    if (zonasArray.length > 0) {
      const promesasZonas = zonasArray.map(nombreZona => {
        return new Zona({ nombre: nombreZona, destino: destinoGuardado._id }).save();
      });
      
      const zonasCreadas = await Promise.all(promesasZonas);
      
      // 4. Guardamos los IDs de las zonas creadas en el documento del destino
      destinoGuardado.zonas = zonasCreadas.map(z => z._id);
      await destinoGuardado.save();
    }

    // Devolvemos el destino completo
    const destinoCompleto = await Destino.findById(destinoGuardado._id).populate('zonas');

    res.status(201).json({ ok: true, mensaje: 'Destino y zonas guardados', datos: destinoCompleto });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al guardar', error: error.message });
  }
};

// PUT: Actualizar un destino existente y sincronizar sus zonas
exports.actualizarDestino = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, administrador, zonas } = req.body;

    let zonasArray = [];
    if (zonas) {
      try { zonasArray = JSON.parse(zonas); } catch (e) { zonasArray = []; }
    }

    // 1. Eliminamos las zonas viejas asociadas a este destino para no dejar basura en la DB
    await Zona.deleteMany({ destino: id });

    // 2. Creamos las nuevas zonas en la base de datos
    const promesasZonas = zonasArray.map(nombreZona => {
      return new Zona({ nombre: nombreZona, destino: id }).save();
    });
    const zonasCreadas = await Promise.all(promesasZonas);
    const nuevosZonasIds = zonasCreadas.map(z => z._id);

    // 3. Actualizamos los datos del destino incluyendo la nueva lista de IDs de zonas
    const destinoActualizado = await Destino.findByIdAndUpdate(
      id, 
      { nombre, descripcion, administrador, zonas: nuevosZonasIds }, 
      { new: true }
    ).populate('zonas');

    if (!destinoActualizado) {
      return res.status(404).json({ ok: false, mensaje: 'Destino no encontrado' }); 
    }

    res.status(200).json({ ok: true, mensaje: 'Destino actualizado', datos: destinoActualizado });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar', error: error.message });
  }
};

// DELETE: Eliminar un destino y en cascada sus zonas
exports.eliminarDestino = async (req, res) => {
  try {
    const { id } = req.params;
    const destinoEliminado = await Destino.findByIdAndDelete(id);

    if (!destinoEliminado) {
      return res.status(404).json({ ok: false, mensaje: 'Destino no encontrado' });
    }

    // Eliminación en cascada: borra todas las zonas que pertenecían a este destino
    await Zona.deleteMany({ destino: id });

    res.status(200).json({ ok: true, mensaje: 'Destino y sus zonas eliminados' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar', error: error.message });
  }
};