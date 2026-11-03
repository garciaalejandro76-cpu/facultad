import { useEffect, useState } from "react";

function Destinos() {
  const [destinos, setDestinos] = useState([]);  
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [administrador, setAdministrador] = useState("");
  const [zonas, setZonas] = useState([]); // Maneja objetos [{_id, nombre}, {nombre}]
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
      setZonas([...zonas, { nombre: nuevaZona.trim() }]);
      setNuevaZona(""); 
    }
  };

  const handleEliminarZona = (indexParaEliminar) => {
    setZonas(zonas.filter((_, index) => index !== indexParaEliminar));
  };

  const handleEditarClick = (destino) => {
    setEditandoId(destino._id);
    setNombre(destino.nombre);
    setDescripcion(destino.descripcion);
    setAdministrador(destino.administrador);
    
    if (destino.zonas && Array.isArray(destino.zonas)) {
      setZonas(destino.zonas.map(z => typeof z === 'object' ? { _id: z._id, nombre: z.nombre } : { nombre: z }));
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // 💡 CLAVE: Al no haber fotos, construimos un objeto JSON limpio
    const datosDestino = {
      nombre,
      descripcion,
      administrador,
      zonas // Enviamos la lista de objetos de zona directamente
    };

    const urlBase = `${import.meta.env.VITE_BACKEND_URL}/api/destinos`;
    const urlFetch = editandoId ? `${urlBase}/${editandoId}` : urlBase;
    const metodo = editandoId ? "PUT" : "POST";

    fetch(urlFetch, {
      method: metodo,
      headers: {
        "Content-Type": "application/json" // Le avisa al servidor Express que procese el texto como JSON
      },
      body: JSON.stringify(datosDestino), 
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          cancelarEdicion();
          cargarDestinos();
        } else {
          alert("Error en la operación: " + data.mensaje);
        }
      })
      .catch((err) => console.error("Error al procesar destino:", err));
  };

  const handleDelete = (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este destino?");
    if (!confirmar) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/destinos/${id}`, { method: "DELETE" })
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

  return (
    <div className="seccion-destinos">
      {/* PANEL IZQUIERDO: FORMULARIO */}
      <section className="panel-formulario" aria-labelledby="titulo-formulario">
        <h2 id="titulo-formulario">{editandoId ? "Modificar Destino" : "Cargar Nuevo Destino"}</h2>
        <form onSubmit={handleSubmit} className="formulario-carga">
          <div className="form-group">
            <label>Nombre del Destino</label>
            <input type="text" placeholder="Ej. San Juan" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea placeholder="Añade una descripción breve..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
          </div>    
          <div className="form-group">
            <label>Administrador</label>
            <input type="text" placeholder="Nombre del encargado" value={administrador} onChange={(e) => setAdministrador(e.target.value)} required />
          </div>        
          <div className="form-group">
            <label>Zonas del Destino</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input type="text" value={nuevaZona} onChange={(e) => setNuevaZona(e.target.value)} placeholder="Ej. Zona Centro" />
              <button type="button" onClick={handleAgregarZona} className="btn btn-secundario">Agregar</button>
            </div>
            {zonas.length > 0 && (
              <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
                {zonas.map((z, index) => (
                  <li key={index} style={{ marginBottom: "5px", fontSize: "0.95rem" }}>
                    📍 {z.nombre} <button type="button" onClick={() => handleEliminarZona(index)} style={{ color: "var(--danger)", border: "none", background: "none", cursor: "pointer", marginLeft: "5px", fontWeight: "600" }}>(Quitar)</button>
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

      {/* PANEL DERECHO: LISTADO */}
      <section className="panel-listado" aria-labelledby="titulo-listado">
        <h2 id="titulo-listado">Listado de Destinos <span className="contador">({destinos.length})</span></h2>
        {destinos.length === 0 ? (
          <p className="mensaje-vacio">No se encontraron destinos cargados.</p>
        ) : (
          <div className="grid-destinos">
            {destinos.map((destino) => (
              <article key={destino._id} className="tarjeta-destino">
                <div className="tarjeta-info">
                  <h3 className="tarjeta-titulo-lugar">{destino.nombre}</h3>
                  <p className="descripcion">{destino.descripcion}</p>
                  
                  <div className="tarjeta-metadatos">
                    <div className="detalles">
                      <span className="badge-icon">👤</span>
                      <span className="badge-texto"><strong>Admin:</strong> {destino.administrador}</span>
                    </div>
                    
                    {destino.zonas && destino.zonas.length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <span className="badge-icon">📍</span> <strong>Zonas asociadas:</strong>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                          {destino.zonas.map((zona) => (
                            <span 
                              key={zona._id} 
                              title={`ID de la zona: ${zona._id}`} 
                              style={{ background: "#edf2f7", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", color: "var(--text-main)", fontWeight: "500" }}
                            >
                              {zona.nombre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="tarjeta-acciones">
                  <button type="button" onClick={() => handleEditarClick(destino)} className="btn btn-editar">Editar datos</button>
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