import { useEffect, useState } from "react";


function Lugares() {

  const [lugares, setLugares] = useState([]);  
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [horario, setHorario] = useState("");
  const [imagen, setImagen] = useState("");

  // Estado para saber si estamos editando un lugar existente (guarda su _id)
  const [editandoId, setEditandoId] = useState(null);

  // 1. GET: Cargar productos
  const cargarLugares = () => {
    fetch("http://localhost:3000/api/lugares")
      .then((resp) => resp.json())
      .then((data) => {
        if (data.ok) {
          setLugares(data.datos);
        }
      })
      .catch((err) => console.error("Error al consultar lugares:", err));
  };

  useEffect(() => {
    cargarLugares();
  }, []);

  // 2. POST o PUT: Manejador único de formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    const lugarPayload = {
       nombre, descripcion,ubicacion,horario,imagen
    };
    if (editandoId) {
      // 1 MODO EDICIÓN: PUT
      fetch(`http://localhost:3000/api/lugares/${editandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lugarPayload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            cancelarEdicion();
            cargarLugares();
          } else {
            alert("Error al actualizar: " + data.mensaje);
          }
        })
        .catch((err) => console.error("Error al editar:", err));
    } else {
      // 2 MODO CREACIÓN: POST
      fetch("http://localhost:3000/api/lugares", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lugarPayload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            cancelarEdicion();
            cargarLugares();
          } else {
            alert("Error: " + data.mensaje);
          }
        })
        .catch((err) => console.error("Error al guardar:", err));
    }
  };

  // 3. DELETE: Eliminar producto
  const handleDelete = (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este lugar?");
    if (!confirmar) return;

    fetch(`http://localhost:3000/api/lugares/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          // Si justo estábamos editando el que se eliminó, limpiamos el form
          if (editandoId === id) cancelarEdicion();
          cargarLugares();
        } else {
          alert("Error al eliminar: " + data.mensaje);
        }
      })
      .catch((err) => console.error("Error al eliminar:", err));
  };

  // 4. Cargar datos del lugar en el formulario para editar
  const handleEditarClick = (lugar) => {
    setEditandoId(lugar._id);
    setNombre(lugar.nombre);
    setDescripcion(lugar.descripcion);
    setUbicacion(lugar.ubicacion);
    setHorario(lugar.horario);
    setImagen(lugar.imagen);
  };

  // 5. Cancelar edición y limpiar inputs
  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre("");
    setDescripcion("");
    setUbicacion("");
    setHorario("");
    setImagen("");
  };

  return (
    <div >

    
      <form onSubmit={handleSubmit}>
        <h3>
          {editandoId ? "Modificar Lugar" : "Formulario de Carga de Lugares"}
        </h3>

        <input
          type="text"
          placeholder="Nombre del Lugar"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Descripcion del Lugar"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />    
        <input
          type="text"
          placeholder="Ubicacion del Lugar"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          required
        />        
        <input
          type="text"
          placeholder="Horario del Lugar"
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Imagen del Lugar"
          value={imagen}
          onChange={(e) => setImagen(e.target.value)}
          required
        />

        <button type="submit">
          {editandoId ? "Actualizar Cambios" : "Guardar Lugar"}
        </button>

        {editandoId && (
          <button type="button" onClick={cancelarEdicion}>
            Cancelar
          </button>
        )}
      </form>

      <h3>Listado de Lugares ({lugares.length})</h3>

      {lugares.length === 0 ? (
        <p>No se encontraron lugares en la base de datos</p>
      ) : (
        <ul>
          {lugares.map((lugar) => (
            <li key={lugar._id}>
              <span>
                <strong>{lugar.nombre}</strong> - {lugar.descripcion}
              </span>
              {" "}
              <button type="button" onClick={() => handleEditarClick(lugar)}>
                Editar
              </button>
              {" "}
              <button type="button" onClick={() => handleDelete(lugar._id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


export default Lugares;