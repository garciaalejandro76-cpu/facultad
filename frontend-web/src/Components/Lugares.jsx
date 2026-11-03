import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function Lugares({ destinoActivoId }) {
  const { usuario } = useAuth();
  
  // Validar si el usuario actual posee el rol de administrador
  const esAdmin = usuario?.rol === 'admin';

  const [lugares, setLugares] = useState([]);  
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [horario, setHorario] = useState("");
  const [imagen, setImagen] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  // Estados para el manejo de relaciones jerárquicas dinámicas con el Backend
  const [destinosLista, setDestinosLista] = useState([]); 
  const [zonasFiltradasForm, setZonasFiltradasForm] = useState([]); 
  const [destinoForm, setDestinoForm] = useState(""); 
  const [zonaForm, setZonaForm] = useState("");       
  const [filtroZonaListado, setFiltroZonaListado] = useState(""); 

  // 1. Obtener la colección de destinos al inicializar el componente para popular los selectores
  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL + "/api/destinos")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setDestinosLista(data.datos);
      })
      .catch((err) => console.error("Error al cargar destinos secundarios:", err));
  }, []);

  // 2. Monitorear el destino del formulario para actualizar en cascada sus zonas correspondientes
  useEffect(() => {
    if (destinoForm) {
      const destinoEncontrado = destinosLista.find(d => d._id === destinoForm);
      setZonasFiltradasForm(destinoEncontrado && Array.isArray(destinoEncontrado.zonas) ? destinoEncontrado.zonas : []);
    } else {
      setZonasFiltradasForm([]);
    }
  }, [destinoForm, destinosLista]);

  // 3. Consultar y filtrar la colección de lugares bajo demanda de la API
  const cargarLugaresEnBaseAFiltros = () => {
    if (!destinoActivoId) return;

    let url = `${import.meta.env.VITE_BACKEND_URL}/api/lugares?destino=${destinoActivoId}`;
    if (filtroZonaListado && filtroZonaListado !== "") {
      url += `&zona=${filtroZonaListado}`;
    }

    fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        if (data.ok) setLugares(data.datos);
      })
      .catch((err) => console.error("Error al consultar lugares filtrados:", err));
  };

  // Sincronizar listado cuando el usuario cambia el destino principal en la cabecera global
  useEffect(() => {
    setFiltroZonaListado(""); 
    cargarLugaresEnBaseAFiltros();
  }, [destinoActivoId]);

  // Sincronizar listado cuando se alterne el filtro por zona específica
  useEffect(() => {
    cargarLugaresEnBaseAFiltros();
  }, [filtroZonaListado]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!esAdmin) return; 

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("destino", destinoForm); 
    formData.append("zona", zonaForm);       
    formData.append("horario", horario);
    formData.append("usuario", usuario?._id || "ID_DE_PRUEBA");

    if (imagen && typeof imagen !== "string") {
      formData.append("imagen", imagen);
    }

    const urlBase = `${import.meta.env.VITE_BACKEND_URL}/api/lugares`;
    const urlFetch = editandoId ? `${urlBase}/${editandoId}` : urlBase;
    const metodo = editandoId ? "PUT" : "POST";

    fetch(urlFetch, {
      method: metodo,
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          cancelarEdicion();
          cargarLugaresEnBaseAFiltros();
        } else {
          alert("Error en la operación: " + data.mensaje);
        }
      })
      .catch((err) => console.error("Error en submit de lugar:", err));
  };

  const handleDelete = (id) => {
    if (!esAdmin) return;
    const confirmar = window.confirm("¿Seguro que deseas eliminar este lugar?");
    if (!confirmar) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/lugares/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          if (editandoId === id) cancelarEdicion();
          cargarLugaresEnBaseAFiltros();
        } else {
          alert("Error al eliminar: " + data.mensaje);
        }
      })
      .catch((err) => console.error("Error al eliminar:", err));
  };

  // 🛠️ FUNCIÓN CORREGIDA: Fuerza la carga inmediata de las zonas correctas en cascada
  const handleEditarClick = (lugar) => {
    if (!esAdmin) return;
    setEditandoId(lugar._id);
    setNombre(lugar.nombre);
    setDescripcion(lugar.descripcion);
    setHorario(lugar.horario);
    setImagen(lugar.imagen);
    
    const idDestino = lugar.destino?._id || "";
    setDestinoForm(idDestino);

    // Buscamos el objeto destino completo para extraer sus zonas inmediatamente
    const destinoEncontrado = destinosLista.find(d => d._id === idDestino);
    if (destinoEncontrado && Array.isArray(destinoEncontrado.zonas)) {
      setZonasFiltradasForm(destinoEncontrado.zonas); // 👈 Forzar asignación inmediata de la lista de zonas
    } else {
      setZonasFiltradasForm([]);
    }

    setZonaForm(lugar.zona?._id || ""); // Ahora el select encontrará el ID mapeado al instante
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre("");
    setDescripcion("");
    setHorario("");
    setImagen(null);
    setDestinoForm("");
    setZonaForm("");
  };

  const obtenerZonasDelDestinoActivo = () => {
    const actual = destinosLista.find(d => d._id === destinoActivoId);
    return actual && Array.isArray(actual.zonas) ? actual.zonas : [];
  };
  return (
    <div 
      className="seccion-lugares" 
      style={!esAdmin ? { gridTemplateColumns: '1fr' } : {}}
    >
      {/* PANEL IZQUIERDO: FORMULARIO (Solo disponible para administradores) */}
      {esAdmin && (
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
              <label htmlFor="destinoForm">Destino Relacionado</label>
              <select 
                id="destinoForm" 
                value={destinoForm} 
                onChange={(e) => { setDestinoForm(e.target.value); setZonaForm(""); }} 
                required
              >
                <option value="">Seleccione un Destino</option>
                {destinosLista.map(d => (
                  <option key={d._id} value={d._id}>{d.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="zonaForm">Zona Específica</label>
              <select 
                id="zonaForm" 
                value={zonaForm} 
                onChange={(e) => setZonaForm(e.target.value)} 
                required 
                disabled={!destinoForm}
              >
                <option value="">Seleccione una Zona</option>
                {zonasFiltradasForm.map(z => (
                  <option key={z._id} value={z._id}>{z.nombre}</option>
                ))}
              </select>
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
                onChange={(e) => setImagen(e.target.files)} 
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
      )}

      {/* PANEL DERECHO: LISTADO */}
      <section className="panel-listado" aria-labelledby="titulo-listado">
        <div className="filtro-contenedor">
          <label htmlFor="filtro-zona" className="filtro-label">Filtrar por zona:</label>
          <select 
            id="filtro-zona" 
            value={filtroZonaListado} 
            onChange={(e) => setFiltroZonaListado(e.target.value)} 
            className="form-select-filtro"
          >
            <option value="">Todas las zonas</option>
            {obtenerZonasDelDestinoActivo().map((z) => (
              <option key={z._id} value={z._id}>{z.nombre}</option>
            ))}
          </select>
        </div>

        <h2 id="titulo-listado">Listado de Lugares <span className="contador">({lugares.length})</span></h2>

        {lugares.length === 0 ? (
          <p className="mensaje-vacio">No se encontraron lugares cargados para este destino o zona.</p>
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
                    <div className="detalles">
                      <span className="badge-icon">🗺️</span>
                      <span className="badge-texto">
                        {lugar.destino?.nombre || "Destino"} — {lugar.zona?.nombre || "Zona"}
                      </span>
                    </div>
                    <div className="detalles">
                      <span className="badge-icon">🕒</span>
                      <span className="badge-texto">{lugar.horario}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones de la Tarjeta (Solo visibles para administradores) */}
                {esAdmin && (
                  <div className="tarjeta-acciones">
                    <button type="button" onClick={() => handleEditarClick(lugar)} className="btn btn-editar">
                      Editar datos
                    </button>
                    <button type="button" onClick={() => handleDelete(lugar._id)} className="btn btn-eliminar">
                      Eliminar
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Lugares;
