import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Importamos tu logotipo oficial para unificar la identidad visual
import logo from "../assets/logo.png"; 

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        alert(resultado.mensaje || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  return (
    // Reutilizamos el contenedor centrado y el panel de formulario estilizado del proyecto
    <div className="container-app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="panel-formulario" style={{ width: '100%', maxWidth: '420px' }}>
        
        {/* Encabezado con tu logotipo integrado */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
          <div className="header-logo-wrapper">
            <img 
              src={logo} 
              alt="Logotipo oficial de Gestión Turística" 
              className="header-logo"
              style={{ height: '120px' }} // Ajuste balanceado para el formulario
            />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Ingreso al Sistema</h2>
        </div>

        {/* Formulario que adopta los estilos de inputs y botones globales */}
        <form onSubmit={handleSubmit} className="formulario-carga">
          
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

          <div className="form-acciones" style={{ marginTop: '10px' }}>
            <button type="submit" className="btn btn-primario">
              <span className="badge-icon">🔐</span> Iniciar Sesión
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};