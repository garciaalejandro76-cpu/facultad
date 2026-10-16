import { useState } from "react";
import logo from "./assets/logo.png";
import './app.css';
import Menu from "./Components/Menu";
import Lugares from "./Components/Lugares";
import Eventos from "./Components/Eventos";
import Comercios from "./Components/Comercios";
import Destinos from "./Components/Destinos";

// 1. Importamos el proveedor y el hook de autenticación
import { AuthProvider, useAuth } from "./context/AuthContext";
// 2. Importamos el componente de Login que creamos previamente
import { Login } from "./Components/Login";

// Creamos un subcomponente interno para manejar la lógica de la app una vez iniciada la sesión
function ContenidoPanel() {
  const [seccion, setSeccion] = useState("lugares");
  // Extraemos la función logout y los datos del usuario por si quieres mostrar su nombre
  const { usuario, logout } = useAuth();

  return (
    <div className="container-app">
      <header className="header-sitio">
        <div className="header-brand">
          <div className="header-logo-wrapper">
            <img 
              src={logo} 
              alt="Logotipo oficial de Gestión Turística" 
              className="header-logo"
            />
          </div>

          <select name="categoria" defaultValue="" className="header-select">
            <option value="Iglesia">Iglesia San Juan</option>
            <option value="Calingasta">Calingasta San Juan</option>
            <option value="Valle Fretil">Valle Fertil San Juan</option>
          </select>
        </div>
        
        {/* Le pasamos el estado al menú para que pinte los botones */}
        <Menu seccion={seccion} setSeccion={setSeccion} /> 

        {/* Botón de cerrar sesión integrado en el header */}
        <div className="header-logout-container" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', color: '#555' }}>Hola, {usuario?.nombre}</span>
          <button 
            onClick={logout} 
            style={{
              padding: '6px 12px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* El contenido ahora vive COMPLETAMENTE FUERA del header. Esto arregla el modo web */}
      <main className="contenido">
        {seccion === "lugares" && <Lugares />}
        {seccion === "eventos" && <Eventos />}
        {seccion === "comercios" && <Comercios />}
        {seccion === "destinos" && <Destinos />}
      </main>
    </div>
  );
}

// Componente principal que decide si mostrar el Login o el Panel Turístico
function App() {
  const { estaAutenticado } = useAuth();

  // Si no está logueado, lo obligamos a ver el formulario de Login
  if (!estaAutenticado) {
    return <Login />;
  }

  // Si está logueado, renderiza la estructura original de tu aplicación
  return <ContenidoPanel />;
}

// Exportamos la aplicación envuelta de manera obligatoria en el AuthProvider para que funcione useAuth()
export default function AppConAutenticacion() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}