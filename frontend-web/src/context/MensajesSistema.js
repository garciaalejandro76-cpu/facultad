export const MensajesSistema = {
  auth: {
    camposObligatorios: "Por favor, completa todos los campos requeridos.",
    credencialesInvalidas: "El correo electrónico o la contraseña que ingresaste no son correctos. Inténtalo de nuevo.",
    errorRed: "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.",
    errorDesconocido: "Ocurrió un error inesperado al intentar iniciar sesión.",
    registroExito: "¡Usuario registrado exitosamente! Ya puedes iniciar sesión.",
    emailExistente: "El correo electrónico ya está registrado por otro usuario.",
    errorRegistro: "No se pudo completar el registro. Inténtalo de nuevo."
  },
  usuarios: {
    guardadoExito: "Usuario registrado exitosamente."
  },
  // 🔽 NUEVO: Mensajes globales para operaciones de Base de Datos
  crud: {
    crearExito: "Registro guardado correctamente en el sistema.",
    editarExito: "Cambios actualizados y sincronizados con éxito.",
    eliminarExito: "El registro ha sido eliminado permanentemente.",
    errorOperacion: "No se pudo completar la solicitud. Verifique los datos ingresados.",
    errorRed: "Error de comunicación con el servidor central."
  }
};