import { useEffect, useState } from "react";

function Lugares() {
  const [lugares, setLugares] = useState([]);  
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [horario, setHorario] = useState("");
  const [imagen, setImagen] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  const cargarLugares = () => {
    fetch(import.meta.env.VITE_BACKEND_URL + "/api/lugares")
      .then((resp) => resp.json())
      .then((data) => {
        if (data.ok) setLugares(data.datos);
      })
      .catch((err) => console.error("Error al consultar lugares:", err));
  };

  useEffect(() => {
    cargarLugares();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("ubicacion", ubicacion);
    formData.append("horario", horario);
    
    if (imagen && typeof imagen !== "string") {
      formData.append("imagen", imagen);
    }

    if (editandoId) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/lugares/${editandoId}`, {
        method: "PUT",
        body: formData, 
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
      fetch(import.meta.env.VITE_BACKEND_URL + "/api/lugares", {
        method: "POST",
        body: formData,
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

  const handleDelete = (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este lugar?");
    if (!confirmar) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/lugares/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          if (editandoId === id) cancelarEdicion();
          cargarLugares();
        } else {
          alert("Error al eliminar: " + data.mensaje);
        }
      })
      .catch((err) => console.error("Error al eliminar:", err));
  };

  const handleEditarClick = (lugar) => {
    setEditandoId(lugar._id);
    setNombre(lugar.nombre);
    setDescripcion(lugar.descripcion);
    setUbicacion(lugar.ubicacion);
    setHorario(lugar.horario);
    setImagen(lugar.imagen);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre("");
    setDescripcion("");
    setUbicacion("");
    setHorario("");
    setImagen("");
  };

  return (
    <div className="seccion-lugares">
      <section className="panel-formulario" aria-labelledby="titulo-formulario">
        <h2 id="titulo-formulario">{editandoId ? "Modificar Lugar" : "Cargar Nuevo Lugar"}</h2>
        
        <form onSubmit={handleSubmit} className="formulario-carga">
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Lugar</label>
            <input
              id="nombre"
              type="text"
              placeholder="Ej. Playa Bonita"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              placeholder="Añade una descripción breve..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
          </div>    

          <div className="form-group">
            <label htmlFor="ubicacion">Ubicación</label>
            <input
              id="ubicacion"
              type="text"
              placeholder="Dirección o coordenadas"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              required
            />
          </div>        

          <div className="form-group">
            <label htmlFor="horario">Horarios de Visita</label>
            <input
              id="horario"
              type="text"
              placeholder="Ej. Lunes a Viernes 9:00 - 18:00"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              required
            />
          </div>
       
          <div className="form-group">
            <label htmlFor="imagen">Imagen del Lugar</label>
            <input
              id="imagen"
              type="file"
              accept="image/*"
              onChange={(e) => setImagen(e.target.files[0])}
            />
          </div>

          <div className="form-acciones">
            <button type="submit" className="btn btn-primario">
              {editandoId ? "Actualizar" : "Guardar"}
            </button>
            {editandoId && (
              <button type="button" onClick={cancelarEdicion} className="btn btn-secundario">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel-listado" aria-labelledby="titulo-listado">
        <h2 id="titulo-listado">Listado de Lugares <span className="contador">({lugares.length})</span></h2>

        {lugares.length === 0 ? (
          <p className="mensaje-vacio">No se encontraron lugares cargados en el sistema.</p>
        ) : (
          <div className="grid-lugares">
            {lugares.map((lugar) => (
              <article key={lugar._id} className="tarjeta-lugar">
  <div className="tarjeta-imagen-contenedor">
    <img 
      src={`${import.meta.env.VITE_BACKEND_URL}/images/${lugar.imagen}`} 
      alt={`Fotografía de ${lugar.nombre}`}
      className="tarjeta-img"
    />
  </div>

  <div className="tarjeta-info">
    <h3 className="tarjeta-titulo-lugar">{lugar.nombre}</h3>
    <p className="descripcion">{lugar.descripcion}</p>
    
    <div className="tarjeta-metadatos">
      <p className="detalles ubicacion">
        <span className="badge-icon">🗺️</span> 
        <span className="badge-texto">{lugar.ubicacion}</span>
      </p>
      <p className="detalles horario">
        <span className="badge-icon">🕒</span> 
        <span className="badge-texto">{lugar.horario}</span>
      </p>
    </div>
  </div>

  <div className="tarjeta-acciones">
    <button type="button" onClick={() => handleEditarClick(lugar)} className="btn btn-editar">
      Editar datos
    </button>
    <button type="button" onClick={() => handleDelete(lugar._id)} className="btn btn-eliminar">
      Eliminar
    </button>
  </div>
</article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Lugares;