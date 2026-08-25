const Producto = require('../models/Producto');

// -------------------------------------------------------------
// GET: Obtener todos los productos desde MongoDB
// -------------------------------------------------------------
exports.obtenerProductos = async (req, res) => {
  try {
    // Busca y retorna todos los documentos guardados en la colección
    const productos = await Producto.find();
    res.status(200).json({ ok: true, datos: productos });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al consultar la base de datos', error: error.message });
  }
};

// -------------------------------------------------------------
// POST: Guardar un nuevo producto en MongoDB
// -------------------------------------------------------------
exports.crearProducto = async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;

    // Validación básica de campos obligatorios
    if (!nombre || !precio) {
      return res.status(400).json({ ok: false, mensaje: 'Nombre y precio son obligatorios' });
    }

    // Instanciamos el modelo con los datos recibidos
    const nuevoProducto = new Producto({
      nombre,
      precio,
      stock: stock || 0
    });

    // Guardamos de forma persistente en MongoDB Atlas (genera _id automáticamente)
    const productoGuardado = await nuevoProducto.save();

    res.status(201).json({ 
      ok: true, 
      mensaje: 'Producto creado exitosamente en la base de datos', 
      datos: productoGuardado 
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al guardar el producto', error: error.message });
  }
};

// -------------------------------------------------------------
// PUT: Actualizar un producto por su ID de MongoDB
// -------------------------------------------------------------
exports.actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    // findByIdAndUpdate busca por _id y aplica los cambios del req.body
    // { new: true } hace que devuelva el objeto ya actualizado
    const productoActualizado = await Producto.findByIdAndUpdate(id, req.body, { new: true });

    if (!productoActualizado) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    }

    res.status(200).json({ 
      ok: true, 
      mensaje: 'Producto actualizado correctamente', 
      datos: productoActualizado 
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar el producto', error: error.message });
  }
};

// -------------------------------------------------------------
// DELETE: Eliminar un producto por su ID de MongoDB
// -------------------------------------------------------------
exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    // Busca por _id y lo elimina de la colección
    const productoEliminado = await Producto.findByIdAndDelete(id);

    if (!productoEliminado) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    }

    res.status(200).json({ ok: true, mensaje: 'Producto eliminado correctamente de la BD' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar el producto', error: error.message });
  }
};