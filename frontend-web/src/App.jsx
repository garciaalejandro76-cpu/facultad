import logo from "./assets/logo.png"
import './App.css'
import Menu from "./Components/Menu"
function App() {
return (

<div className="container">
<header className="encabezado">
<img className="logo" src={logo} alt="logo" ></img>
<h1>Portal Turístico</h1>
</header>
<Menu />
</div>

);
}
export default App;