import { useState } from "react"
import Lugares from "./Lugares"
import Eventos from "./Eventos"
import Comercios from "./Comercios"

function Menu() {
const [seccion, setSeccion] = useState("lugares");

return (
<div>
<nav>
<button onClick={() => setSeccion("lugares")}>
Lugares
</button>

<button onClick={() => setSeccion("eventos")}>
Eventos
</button>

<button onClick={() => setSeccion("comercios")}>
Comercios
</button>
</nav>


{seccion === "lugares" && <Lugares />}
{seccion === "eventos" && <Eventos />}
{seccion === "comercios" && <Comercios />}
</div>
);
}

export default Menu;