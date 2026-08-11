let productos = [
{ id: '1', nombre: 'Teclado Mecánico', precio: 45000, stock: 10 },
{ id: '2', nombre: 'Mouse Óptico', precio: 18000, stock: 25 }
];
exports.obtenerProductos = (req, res, next) => {
try {
res.status(200).json({ ok: true, datos: productos });
} catch (error) {
next(error);
}
};
exports.crearProducto = (req, res, next) => {
try {
const { nombre, precio, stock } = req.body;
if (!nombre || !precio) {
return res.status(400).json({
ok: false,
mensaje: 'Bad Request: Nombre y precio son obligatorios'
});
}
const nuevoProducto = { id: Date.now().toString(), nombre, precio, stock: stock || 0 };
productos.push(nuevoProducto);
res.status(201).json({ ok: true, mensaje: 'Producto creado', datos: nuevoProducto });
} catch (error) {
next(error);
}
};