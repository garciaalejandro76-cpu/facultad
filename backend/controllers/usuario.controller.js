const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Requerido para encriptar si se actualiza password

// 1. Obtener todos los usuarios (sin exponer la contraseña)
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password');
    res.status(200).json({ ok: true, datos: usuarios });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al consultar usuarios', error: error.message });
  }
};

// 2. Obtener un usuario por ID
exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id).select('-password');

    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json({ ok: true, datos: usuario });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al buscar el usuario', error: error.message });
  }
};

// 3. Crear un nuevo usuario
exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ ok: false, mensaje: 'Nombre, email y contraseña son obligatorios' });
    }

    // Verificar si el correo ya existe
    const existeEmail = await Usuario.findOne({ email });
    if (existeEmail) {
      return res.status(400).json({ ok: false, mensaje: 'El correo electrónico ya está registrado' });
    }

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password,
      rol: rol || 'cliente'
    });

    const usuarioGuardado = await nuevoUsuario.save();

    // Ocultar contraseña en la respuesta JSON
    const respuesta = usuarioGuardado.toObject();
    delete respuesta.password;

    res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado exitosamente en MongoDB Atlas',
      datos: respuesta
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al crear usuario', error: error.message });
  }
};

// 4. Actualizar datos de un usuario (CORREGIDO PARA ADMITIR CAMBIO DE CONTRASEÑA SEGURO)
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const datosAActualizar = { ...req.body };

    // Si el usuario envió una contraseña para actualizar, la encriptamos manualmente
    if (datosAActualizar.password) {
      const salt = await bcrypt.genSalt(10);
      datosAActualizar.password = await bcrypt.hash(datosAActualizar.password, salt);
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      datosAActualizar,
      { new: true, runValidators: true }
    ).select('-password');

    if (!usuarioActualizado) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json({
      ok: true,
      mensaje: 'Usuario actualizado correctamente',
      datos: usuarioActualizado
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar usuario', error: error.message });
  }
};

// 5. Eliminar un usuario
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioEliminado = await Usuario.findByIdAndDelete(id);

    if (!usuarioEliminado) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json({ ok: true, mensaje: 'Usuario eliminado correctamente de la BD' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar usuario', error: error.message });
  }
};

// 6. Autenticar Usuario (Login)
exports.loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos obligatorios
    if (!email || !password) {
      return res.status(400).json({ ok: false, mensaje: 'Email y contraseña son obligatorios' });
    }

    // Buscar si el usuario existe y si está activo
    const usuario = await Usuario.findOne({ email });
    if (!usuario || !usuario.activo) {
      return res.status(400).json({ ok: false, mensaje: 'Credenciales inválidas o cuenta inactiva' });
    }

    // Validar contraseña usando el método del esquema
    const esPasswordValido = await usuario.compararPassword(password);
    if (!esPasswordValido) {
      return res.status(400).json({ ok: false, mensaje: 'Credenciales inválidas' });
    }

    // Generar Token JWT 
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET || 'TU_FIRMA_SECRETA',
      { expiresIn: '15m' } 
    );

    // Ocultar contraseña en la respuesta JSON
    const datosUsuario = usuario.toObject();
    delete datosUsuario.password;

    res.status(200).json({
      ok: true,
      mensaje: 'Inicio de sesión exitoso',
      datos: datosUsuario,
      token: token 
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error en el servidor al iniciar sesión', error: error.message });
  }
};