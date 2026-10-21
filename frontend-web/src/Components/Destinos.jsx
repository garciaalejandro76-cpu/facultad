import { useEffect, useState } from "react";

function Destinos() {
  const [destinos, setDestinos] = useState([]);  
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [administrador, setAdministrador] = useState("");
  const [zonas, setZonas] = useState([]); // Maneja strings en el formulario
  const [nuevaZona, setNuevaZona] = useState(""); 
  const [editandoId, setEditandoId] = useState(null);

  const cargarDestinos = () => {
    fetch(import.meta.env.VITE_BACKEND_URL + "/api/destinos")
      .then((resp) => resp.json())
      .then((data) => {
        if (data.ok) setDestinos(data.datos);
      })
      .catch((err) => console.error("Error al consultar destinos:", err));
  };

  useEffect(() => {
    cargarDestinos();
  }, []);

  const handleAgregarZona = () => {
    if (nuevaZona.trim() !== "") {
      setZonas([...zonas, nuevaZona.trim()]);
      setNuevaZona(""); 
    }
  };

  const handleEliminarZona = (indexParaEliminar) => {
    setZonas(zonas.filter((_, index) => index !== indexParaEliminar));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("administrador", administrador);
    formData.append("zonas", JSON.stringify(zonas)); // Se envía la lista de strings

    if (editandoId) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/destinos/${editandoId}`, {
        method: "PUT",
        body: formData, 
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            cancelarEdicion();
            cargarDestinos();
          } else {
            alert("Error al actualizar: " + data.mensaje);
          }
        })
        .catch((err) => console.error("Error al editar:", err));
    } else {
      fetch(import.meta.env.VITE_BACKEND_URL + "/api/destinos", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            cancelarEdicion();
            cargarDestinos();
          } else {
            alert("Error: " + data.mensaje);
          }
        })
        .catch((err) => console.error("Error al guardar:", err));
    }
  };

  const handleDelete = (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este destino?");
    if (!confirmar) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/destinos/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          if (editandoId === id) cancelarEdicion();
          cargarDestinos();
        } else {
          alert("Error al eliminar: " + data.mensaje);
        }
      })
      .catch((err) => console.error("Error al eliminar:", err));
  };

  const handleEditarClick = (destino) => {
    setEditandoId(destino._id);
    setNombre(destino.nombre);
    setDescripcion(destino.descripcion);
    setAdministrador(destino.administrador);
    
    // Mapeamos el objeto completo devuelto por Populate a strings simples para el formulario
    if (destino.zonas && Array.isArray(destino.zonas)) {
      setZonas(destino.zonas.map(z => typeof z === 'object' ? z.nombre : z));
    } else {
      setZonas([]);
    }
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre("");
    setDescripcion("");
    setAdministrador("");
    setZonas([]);
    setNuevaZona("");
  };

  return (
    <div className="seccion-destinos">
      <section className="panel-formulario">
        <h2>{editandoId ? "Modificar Destino" : "Cargar Nuevo Destino"}</h2>
        <form onSubmit={handleSubmit} className="formulario-carga">
          <div className="form-group">
            <label>Nombre del Destino</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
          </div>    
          <div className="form-group">
            <label>Administrador</label>
            <input type="text" value={administrador} onChange={(e) => setAdministrador(e.target.value)} required />
          </div>        
          <div className="form-group">
            <label>Zonas del Destino</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input type="text" value={nuevaZona} onChange={(e) => setNuevaZona(e.target.value)} placeholder="Ej. Zona Centro" />
              <button type="button" onClick={handleAgregarZona} className="btn btn-secundario">Agregar</button>
            </div>
            {zonas.length > 0 && (
              <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
                {zonas.map((zona, index) => (
                  <li key={index}>
                    {zona} <button type="button" onClick={() => handleEliminarZona(index)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>(Quitar)</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-acciones">
            <button type="submit" className="btn btn-primario">{editandoId ? "Actualizar" : "Guardar"}</button>
            {editandoId && <button type="button" onClick={cancelarEdicion} className="btn btn-secundario">Cancelar</button>}
          </div>
        </form>
      </section>

      <section className="panel-listado">
        <h2>Listado de Destinos <span className="contador">({destinos.length})</span></h2>
        {destinos.length === 0 ? (
          <p>No se encontraron destinos cargados.</p>
        ) : (
          <div className="grid-destinos">
            {destinos.map((destino) => (
              <article key={destino._id} className="tarjeta-destino">
                <div className="tarjeta-info">
                  <h3>{destino.nombre}</h3>
                  <p>{destino.descripcion}</p>
                  <div className="tarjeta-metadatos">
                    <p>👤 Admin: {destino.administrador}</p>
                    
                    {/* CAMBIO CLAVE AQUÍ: Se mapean los objetos zonas usando su zona._id propio */}
                    {destino.zonas && destino.zonas.length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        📍 <strong>Zonas independientes:</strong>{" "}
                        {destino.zonas.map((zona) => (
                          <span key={zona._id} title={`ID de la zona: ${zona._id}`} style={{ marginRight: "8px", background: "#eee", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" }}>
                            {zona.nombre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="tarjeta-acciones">
                  <button type="button" onClick={() => handleEditarClick(destino)} className="btn btn-editar">Editar</button>
                  <button type="button" onClick={() => handleDelete(destino._id)} className="btn btn-eliminar">Eliminar</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Destinos;