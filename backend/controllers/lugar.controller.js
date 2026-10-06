const Lugar = require('../models/Lugar');

// GET: Obtener todos los productos
exports.obtenerLugares = async (req, res) => {
  try {
    // Busca y retorna todos los documentos guardados en la colección
    const lugares = await Lugar.find();
    // Responde con status 200 (OK) y envía el listado completo de productos
    res.status(200).json({ 
      ok: true, 
      datos: lugares 
    });
  } catch (error) {
    // Manejo básico de errores enviando status 500 (Internal Server Error)
    res.status(500).json({ ok: false, mensaje: 'Error al obtener los lugares desde la base de datos' });
  }
};

// POST: Crear un nuevo producto
exports.crearLugar = async (req, res) => {
  try {
    // Extraemos los datos enviados en el cuerpo (Body) de la petición HTTP
    const { nombre,descripcion,ubicacion,horario,imagen } = req.body;

    // VALIDACIÓN: Si falta nombre o precio, respondemos con 400 (Bad Request)
    if (!nombre) {
      return res.status(400).json({ 
        ok: false, 
        mensaje: 'El nombre es campos obligatorios' 
      });
    }

    // Instancia el modelo con los datos recibidos
    const nuevoLugar = new Lugar({
         nombre,
         descripcion,
         ubicacion,
         horario,
         imagen
    });
   
    // Guardado de forma persistente en la DB
    const lugarGuardado = await nuevoLugar.save();

    // Respondemos con status 201 (Created) enviando el objeto creado
    res.status(201).json({ 
      ok: true, 
      mensaje: 'Lugar guardado exitosamente en la base de datos', 
      datos: lugarGuardado 
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al guardar el lugar en la base de datos', error: error.mesagge });
  }
};

// PUT: Actualizar un producto existente por su ID
exports.actualizarLugar = async (req, res) => {
  try {
    // Capturamos el ID enviado desde la URL (Path Parameter)
    const { id } = req.params;
 
    const lugarActualizado = await Lugar.findByIdAndUpdate(id, req.body, {new: true});

   if(!lugarActualizado){
    return res.status(404).json({ok:false, mensaje: 'Lugar no encontrado en la base de datos'}); 
   }

   res.status(200).json({
    ok: true,
    mensaje: 'Lugar actualizado correctamente en la DB',
    datos: lugarActualizado
   });
  }catch (error){
    res.status(500).json({ok: false, mensaje: 'Error al actualizar el lugar', error: error.message});
  }
};

// DELETE: Eliminar un producto por su ID
exports.eliminarLugar = async (req, res) => {
  try {
    const { id } = req.params;

    //Busca el producto por ID y lo elimina de la DB
    const lugarEliminado = await Lugar.findByIdAndDelete(id);

    if(!lugarEliminado){
      return res.status(404).json({ok: false, mensaje: 'Lugar no encontrado'});
    }

    res.status(200).json({ 
      ok: true, 
      mensaje: 'Lugar eliminado correctamente de la base de datos' 
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar el lugar', error: error.mesagge});
  }
};