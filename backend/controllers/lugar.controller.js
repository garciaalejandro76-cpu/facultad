const Lugar = require('../models/Lugar');

// GET: Obtener todos los productos
exports.obtenerLugares = async (req, res) => {
  try {
    const lugares = await Lugar.find();
    res.status(200).json({ 
      ok: true, 
      datos: lugares 
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener los lugares desde la base de datos' });
  }
};

// POST: Crear un nuevo producto
exports.crearLugar = async (req, res) => {
  try {
    const { nombre, descripcion, ubicacion, horario } = req.body;

    if (!nombre) {
      return res.status(400).json({ 
        ok: false, 
        mensaje: 'El nombre es un campo obligatorio' 
      });
    }

    const nuevoLugar = new Lugar({
         nombre,
         descripcion,
         ubicacion,
         horario,
         // Multer guarda la información del archivo en req.file si se seleccionó uno
         imagen: req.file ? req.file.filename : null
    });
   
    const lugarGuardado = await nuevoLugar.save();

    res.status(201).json({ 
      ok: true, 
      mensaje: 'Lugar guardado exitosamente en la base de datos', 
      datos: lugarGuardado 
    });
  } catch (error) {
    // Se corrigió "error.mesagge" por "error.message"
    res.status(500).json({ ok: false, mensaje: 'Error al guardar el lugar en la base de datos', error: error.message });
  }
};

// PUT: Actualizar un producto existente por su ID
exports.actualizarLugar = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Clonamos los campos de texto normales que vienen en req.body
    const camposAActualizar = { ...req.body };

    // 2. Si el usuario subió una nueva imagen en el formulario, la agregamos al objeto de actualización
    if (req.file) {
      camposAActualizar.imagen = req.file.filename;
    }
 
    // 3. Pasamos el objeto combinado a la base de datos
    const lugarActualizado = await Lugar.findByIdAndUpdate(id, camposAActualizar, { new: true });

    if (!lugarActualizado) {
      return res.status(404).json({ ok: false, mensaje: 'Lugar no encontrado en la base de datos' }); 
    }

    res.status(200).json({
      ok: true,
      mensaje: 'Lugar actualizado correctamente en la DB',
      datos: lugarActualizado
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar el lugar', error: error.message });
  }
};

// DELETE: Eliminar un producto por su ID
exports.eliminarLugar = async (req, res) => {
  try {
    const { id } = req.params;

    const lugarEliminado = await Lugar.findByIdAndDelete(id);

    if (!lugarEliminado) {
      return res.status(404).json({ ok: false, mensaje: 'Lugar no encontrado' });
    }

    res.status(200).json({ 
      ok: true, 
      mensaje: 'Lugar eliminado correctamente de la base de datos' 
    });
  } catch (error) {
    // Se corrigió "error.mesagge" por "error.message"
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar el lugar', error: error.message });
  }
};