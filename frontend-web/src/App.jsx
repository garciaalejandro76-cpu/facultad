import { useState } from "react";
import logo from "./assets/logo.png";
import './app.css';
import Menu from "./Components/Menu";
import Lugares from "./Components/Lugares";
import Eventos from "./Components/Eventos";
import Comercios from "./Components/Comercios";
import Destinos from "./Components/Destinos";

function App() {
  // Trasladamos el estado de la sección activa aquí para separar la estructura
  const [seccion, setSeccion] = useState("lugares");

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
  <option value="Iglesia" >Iglesia San Juan</option>
  <option value="Calingasta">Calingasta San Juan</option>
  <option value="Valle Fretil">Valle Fertil San Juan</option>
</select>

        </div>
        
        {/* Le pasamos el estado al menú para que pinte los botones */}
        <Menu seccion={seccion} setSeccion={setSeccion} /> 
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

export default App;