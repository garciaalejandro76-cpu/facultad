import { useState, useEffect } from "react";
import logo from "./assets/logo.png";
import './app.css';
import Menu from "./Components/Menu";
import Lugares from "./Components/Lugares";
import Eventos from "./Components/Eventos";
import Prestadores from "./Components/Prestadores";
import Destinos from "./Components/Destinos";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Login } from "./Components/Login";

function ContenidoPanel() {
  const [seccion, setSeccion] = useState("lugares");
  const [destinos, setDestinos] = useState([]);
  const [destinoSeleccionadoId, setDestinoSeleccionadoId] = useState(""); // Guarda el ID del destino activo
  const { usuario, logout } = useAuth();

  // Cargamos la lista de destinos reales de la DB para poblar el select del Header
  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL + "/api/destinos")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.datos.length > 0) {
          setDestinos(data.datos);
          setDestinoSeleccionadoId(data.datos[0]._id); // Inicializa con el primer destino por defecto
        }
      })
      .catch((err) => console.error("Error al traer destinos en App:", err));
  }, []);

  return (
    <div className="container-app">
     <header className="header-sitio">
  <div className="header-brand">
    <div className="header-logo-wrapper">
      <img src={logo} alt="Logotipo oficial de Gestión Turística" className="header-logo" />
    </div>

    <select 
      name="destino-activo" 
      value={destinoSeleccionadoId} 
      onChange={(e) => setDestinoSeleccionadoId(e.target.value)} 
      className="header-select"
    >
      {destinos.length === 0 && <option value="">Cargando destinos...</option>}
      {destinos.map((dest) => (
        <option key={dest._id} value={dest._id}>
          {dest.nombre}
        </option>
      ))}
    </select>
  </div>
  
  {/* El menú ahora contiene de forma autónoma el saludo y el botón Salir */}
  <Menu seccion={seccion} setSeccion={setSeccion} /> 
</header>

      <main className="contenido">
        {/* ENVIAMOS EL DESTINO SELECCIONADO COMO PROP A LUGARES */}
        {seccion === "lugares" && <Lugares destinoActivoId={destinoSeleccionadoId} />}
        {seccion === "eventos" && <Eventos destinoActivoId={destinoSeleccionadoId} />}
        {seccion === "prestadores" && <Prestadores destinoActivoId={destinoSeleccionadoId} />}
        {seccion === "destinos" && <Destinos />}
      </main>
    </div>
  );
}

function App() {
  const { estaAutenticado } = useAuth();
  if (!estaAutenticado) return <Login />;
  return <ContenidoPanel />;
}

export default function AppConAutenticacion() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}