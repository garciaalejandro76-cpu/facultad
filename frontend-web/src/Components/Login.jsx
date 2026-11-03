import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MensajesSistema } from '../context/MensajesSistema';
import logo from "../assets/logo.png"; 

export const Login = () => {
  // Estado para alternar vistas: 'login' o 'registro'
  const [vista, setVista] = useState('login'); 
  
  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados de feedback visual
  const [errorVisible, setErrorVisible] = useState('');
  const [exitoVisible, setExitoVisible] = useState('');
  
  const { login } = useAuth();

  // Cambiar de vista limpiando estados de mensajes
  const cambiarVista = (nuevaVista) => {
    setVista(nuevaVista);
    setErrorVisible('');
    setExitoVisible('');
    setNombre('');
    setEmail('');
    setPassword('');
  };

  // Manejador del Inicio de Sesión
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorVisible('');

    try {
      const respuesta = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/usuarios/login`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const resultado = await respuesta.json();

      if (resultado.ok) {
        login(resultado.datos, resultado.token); 
      } else {
        if (resultado.mensaje === 'Email o clave inválidos' || resultado.mensaje === 'Credenciales inválidas o cuenta inactiva') {
          setErrorVisible(MensajesSistema.auth.credencialesInvalidas);
        } else {
          setErrorVisible(resultado.mensaje || MensajesSistema.auth.errorDesconocido);
        }
      }
    } catch (error) {
      console.error('Error de red:', error);
      setErrorVisible(MensajesSistema.auth.errorRed);
    }
  };

  // Manejador del Registro de Usuario
  const handleRegistroSubmit = async (e) => {
    e.preventDefault();
    setErrorVisible('');
    setExitoVisible('');

    try {
      const respuesta = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/usuarios`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }) // Envía por defecto rol: 'cliente' en el backend
      });

      const resultado = await respuesta.json();

      if (respuesta.status === 201 || resultado.ok) {
        setExitoVisible(MensajesSistema.auth.registroExito);
        // Limpiar campos y mandar al Login tras 2 segundos
        setTimeout(() => {
          cambiarVista('login');
        }, 2500);
      } else {
        if (resultado.mensaje?.includes('ya está registrado')) {
          setErrorVisible(MensajesSistema.auth.emailExistente);
        } else {
          setErrorVisible(resultado.mensaje || MensajesSistema.auth.errorRegistro);
        }
      }
    } catch (error) {
      console.error('Error de red:', error);
      setErrorVisible(MensajesSistema.auth.errorRed);
    }
  };

  return (
    <div className="container-app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="panel-formulario" style={{ width: '100%', maxWidth: '420px' }}>
        
        {/* Encabezado */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
          <div className="header-logo-wrapper">
            <img 
              src={logo} 
              alt="Logotipo oficial de Gestión Turística" 
              className="header-logo"
              style={{ height: '120px' }} 
            />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
            {vista === 'login' ? 'Ingreso al Sistema' : 'Registro de Cuenta'}
          </h2>
        </div>

        {/* Alertas integradas en el flujo visual */}
        {errorVisible && (
          <div className="alerta-error">
            <span className="badge-icon">⚠️</span>
            <p>{errorVisible}</p>
          </div>
        )}

        {exitoVisible && (
          <div className="alerta-exito">
            <span className="badge-icon">✅</span>
            <p>{exitoVisible}</p>
          </div>
        )}

        {/* VISTA 1: FORMULARIO DE LOGIN */}
        {vista === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="formulario-carga">
            <div className="form-group">
              <label htmlFor="login-email">Correo Electrónico</label>
              <input 
                id="login-email"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Contraseña</label>
              <input 
                id="login-password"
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>

            <div className="form-acciones" style={{ marginTop: '10px', flexDirection: 'column', gap: '12px' }}>
              <button type="submit" className="btn btn-primario" style={{ width: '100%' }}>
                <span className="badge-icon">🔐</span> Iniciar Sesión
              </button>
              
              <div style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '10px' }}>
                <span style={{ color: 'var(--text-muted)' }}>¿No tienes una cuenta? </span>
                <button 
                  type="button" 
                  onClick={() => cambiarVista('registro')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Registrarse
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* VISTA 2: FORMULARIO DE REGISTRO */
          <form onSubmit={handleRegistroSubmit} className="formulario-carga">
            <div className="form-group">
              <label htmlFor="registro-nombre">Nombre Completo</label>
              <input 
                id="registro-nombre"
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                required 
                placeholder="Tu nombre y apellido"
              />
            </div>

            <div className="form-group">
              <label htmlFor="registro-email">Correo Electrónico</label>
              <input 
                id="registro-email"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="registro-password">Contraseña</label>
              <input 
                id="registro-password"
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Crea una contraseña segura"
              />
            </div>

            <div className="form-acciones" style={{ marginTop: '10px', flexDirection: 'column', gap: '12px' }}>
              <button type="submit" className="btn btn-primario" style={{ width: '100%', backgroundColor: '#2b6cb0' }}>
                <span className="badge-icon">📝</span> Crear Cuenta
              </button>
              
              <div style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '10px' }}>
                <span style={{ color: 'var(--text-muted)' }}>¿Ya tienes cuenta? </span>
                <button 
                  type="button" 
                  onClick={() => cambiarVista('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Inicia Sesión
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};