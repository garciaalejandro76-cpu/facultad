import { useState } from "react";
import { useAuth } from "../context/AuthContext"; 

function Menu({ seccion, setSeccion }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { usuario, logout } = useAuth(); 

  // 🔽 NUEVO: Validar si el usuario actual posee el rol de administrador
  const esAdmin = usuario?.rol === 'admin';

  const manejarClickPestaana = (nuevaSeccion) => {
    setSeccion(nuevaSeccion);
    setMenuAbierto(false); 
  };

  const manejarLogout = () => {
    setMenuAbierto(false);
    logout();
  };

  return (
    <div className="menu-contenedor-global">
      {/* Botón de Hamburguesa nativo para móviles */}
      <button 
        className="menu-hamburguesa-toggle" 
        onClick={() => setMenuAbierto(!menuAbierto)}
        aria-label="Alternar menú de navegación"
      >
        {menuAbierto ? "✕" : "☰"}
      </button>

      <nav className={`menu ${menuAbierto ? "menu-movil-abierto" : ""}`}>
        {/* Nombre del usuario (Solo visible en móviles dentro del menú desplegable) */}
        <div className="menu-usuario-saludo-movil">
          👤 Hola, {usuario?.nombre}
        </div>

        <button
          className={`menu-btn ${seccion === "lugares" ? "activo" : ""}`}
          onClick={() => manejarClickPestaana("lugares")}
        >
          📍 Lugares
        </button>

        <button
          className={`menu-btn ${seccion === "eventos" ? "activo" : ""}`}
          onClick={() => manejarClickPestaana("eventos")}
        >
          📅 Eventos
        </button>

        <button
          className={`menu-btn ${seccion === "prestadores" ? "activo" : ""}`}
          onClick={() => manejarClickPestaana("prestadores")}
        >
          🛍️ Prestadores
        </button>

        {/* 🔽 NUEVO: Mostrar la pestaña de Destinos ÚNICAMENTE si es Administrador */}
        {esAdmin && (
          <button
            className={`menu-btn ${seccion === "destinos" ? "activo" : ""}`}
            onClick={() => manejarClickPestaana("destinos")}
          >
            📌 Destinos
          </button>
        )}

        {/* Botón Salir unificado dentro de la botonera */}
        <button
          className="menu-btn btn-salir-unificado"
          onClick={manejarLogout}
        >
          🚪 Salir de la Cuenta
        </button>
      </nav>
    </div>
  );
}

export default Menu;