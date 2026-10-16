import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// DEFINIR EL TIEMPO DE SESIÓN ACTIVA (Ejemplo: 15 minutos)
const TIEMPO_EXPIRACION_MS = 15 * 60 * 1000; 

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    // Intentar recuperar sesión guardada al cargar la app
    const sesionGuardada = localStorage.getItem('sesion_usuario');
    const loginTime = localStorage.getItem('sesion_inicio');

    if (sesionGuardada && loginTime) {
      const ahora = Date.now();
      // Validar si el tiempo ya expiró
      if (ahora - parseInt(loginTime) < TIEMPO_EXPIRACION_MS) {
        return JSON.parse(sesionGuardada);
      }
    }
    // Si expiró o no existe, limpiar almacenamiento
    localStorage.removeItem('sesion_usuario');
    localStorage.removeItem('sesion_inicio');
    return null;
  });

  const logout = useCallback(() => {
    localStorage.removeItem('sesion_usuario');
    localStorage.removeItem('sesion_inicio');
    setUsuario(null);
    alert('Tu sesión ha expirado o se ha cerrado.');
  }, []);

  const login = (datosUsuario) => {
    const ahora = Date.now();
    localStorage.setItem('sesion_usuario', JSON.stringify(datosUsuario));
    localStorage.setItem('sesion_inicio', ahora.toString());
    setUsuario(datosUsuario);
  };

  // EFECTO 1: Temporizador para cerrar sesión automáticamente de forma pasiva
  useEffect(() => {
    if (!usuario) return;

    const loginTime = parseInt(localStorage.getItem('sesion_inicio') || '0');
    const ahora = Date.now();
    const tiempoRestante = TIEMPO_EXPIRACION_MS - (ahora - loginTime);

    if (tiempoRestante <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      logout();
    }, tiempoRestante);

    return () => clearTimeout(timer);
  }, [usuario, logout]);

  // EFECTO 2 (Opcional): Reiniciar tiempo si el usuario se mueve (Sesión por Inactividad)
  useEffect(() => {
    if (!usuario) return;

    const actualizarTiempoActividad = () => {
      localStorage.setItem('sesion_inicio', Date.now().toString());
    };

    // Escuchar eventos del usuario para mantener la sesión viva
    window.addEventListener('mousemove', actualizarTiempoActividad);
    window.addEventListener('keydown', actualizarTiempoActividad);
    window.addEventListener('click', actualizarTiempoActividad);

    return () => {
      window.removeEventListener('mousemove', actualizarTiempoActividad);
      window.removeEventListener('keydown', actualizarTiempoActividad);
      window.removeEventListener('click', actualizarTiempoActividad);
    };
  }, [usuario]);

  return (
    <AuthContext.Provider value={{ usuario, login, logout, estaAutenticado: !!usuario }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar la autenticación de forma simple
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

const login = (datosUsuario, token) => {
  const ahora = Date.now();
  localStorage.setItem('sesion_usuario', JSON.stringify(datosUsuario));
  localStorage.setItem('sesion_token', token); // Guardamos el token de seguridad
  localStorage.setItem('sesion_inicio', ahora.toString());
  setUsuario(datosUsuario);
};