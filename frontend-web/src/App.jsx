/*import { useEffect, useState } from "react";
import './App.css'
import logo from "./assets/logo.png";

function App() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");

  // Estado para saber si estamos editando un producto existente (guarda su _id)
  const [editandoId, setEditandoId] = useState(null);

  // 1. GET: Cargar productos
  const cargarProductos = () => {
    fetch("http://localhost:3000/api/productos")
      .then((resp) => resp.json())
      .then((data) => {
        if (data.ok) {
          setProductos(data.datos);
        }
      })
      .catch((err) => console.error("Error al consultar productos:", err));
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // 2. POST o PUT: Manejador único de formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    const productoPayload = {
      nombre,
      precio: Number(precio),
      stock: Number(stock) || 0,
    };

    if (editandoId) {
      // MODO EDICIÓN: PUT
      fetch(`http://localhost:3000/api/productos/${editandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productoPayload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            cancelarEdicion();
            cargarProductos();
          } else {
            alert("Error al actualizar: " + data.mensaje);
          }
        })
        .catch((err) => console.error("Error al editar:", err));
    } else {
      // MODO CREACIÓN: POST
      fetch("http://localhost:3000/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productoPayload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            cancelarEdicion();
            cargarProductos();
          } else {
            alert("Error: " + data.mensaje);
          }
        })
        .catch((err) => console.error("Error al guardar:", err));
    }
  };

  // 3. DELETE: Eliminar producto
  const handleDelete = (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirmar) return;

    fetch(`http://localhost:3000/api/productos/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          // Si justo estábamos editando el que se eliminó, limpiamos el form
          if (editandoId === id) cancelarEdicion();
          cargarProductos();
        } else {
          alert("Error al eliminar: " + data.mensaje);
        }
      })
      .catch((err) => console.error("Error al eliminar:", err));
  };

  // 4. Cargar datos del producto en el formulario para editar
  const handleEditarClick = (prod) => {
    setEditandoId(prod._id);
    setNombre(prod.nombre);
    setPrecio(prod.precio);
    setStock(prod.stock);
  };

  // 5. Cancelar edición y limpiar inputs
  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre("");
    setPrecio("");
    setStock("");
  };

  return (
    <div className="container">

<div className="hero">
<img className="logo" src={logo} alt="logo" ></img>


<div className="hero-text">
<h1>Lugar Turístico</h1>
<p>Sistema de Gestión de Destinos Turísticos</p>
</div>
</div>

      {
//Formulario Dinámico (Crear / Actualizar) 
}
      <form onSubmit={handleSubmit}>
        <h3>
          {editandoId ? "Modificar Producto" : "Formulario de Carga de Productos"}
        </h3>

        <input
          type="text"
          placeholder="Nombre del Producto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Precio del Producto"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Stock del Producto"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        <button type="submit">
          {editandoId ? "Actualizar Cambios" : "Guardar Producto"}
        </button>

        {editandoId && (
          <button type="button" onClick={cancelarEdicion}>
            Cancelar
          </button>
        )}
      </form>

      <h3>Catálogo de Productos ({productos.length})</h3>

      {productos.length === 0 ? (
        <p>No se encontraron productos en la base de datos</p>
      ) : (
        <ul>
          {productos.map((prod) => (
            <li key={prod._id}>
              <span>
                <strong>{prod.nombre}</strong> - ${prod.precio} | Stock: {prod.stock}
              </span>
              {" "}
              <button type="button" onClick={() => handleEditarClick(prod)}>
                Editar
              </button>
              {" "}
              <button type="button" onClick={() => handleDelete(prod._id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;*/


/*

import Menu from "./components/Menu";
import logo from "./assets/logo.png";
 
function App() {
return (
<div>
<header className="encabezado">
{logo}
<h1>Portal Turístico</h1>
</header>
 
<Menu />
</div>
);
}
 
export default App;

*/
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