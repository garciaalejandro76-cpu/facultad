

function Menu({ seccion, setSeccion }) {
  return (
    <nav className="menu">
      <button
        className={`menu-btn ${seccion === "lugares" ? "activo" : ""}`}
        onClick={() => setSeccion("lugares")}
      >
        📍 Lugares
      </button>

      <button
        className={`menu-btn ${seccion === "eventos" ? "activo" : ""}`}
        onClick={() => setSeccion("eventos")}
      >
        📅 Eventos
      </button>

      <button
        className={`menu-btn ${seccion === "comercios" ? "activo" : ""}`}
        onClick={() => setSeccion("comercios")}
      >
        🛍️ Comercios
      </button>

      <button
        className={`menu-btn ${seccion === "destinos" ? "activo" : ""}`}
        onClick={() => setSeccion("destinos")}
      >
        📌 Destinos
      </button>
    </nav>
  );
}

export default Menu;