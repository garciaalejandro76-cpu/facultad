import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { MensajesSistema } from "../context/MensajesSistema";

function Eventos({ destinoActivoId }) {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  const [eventos, setEventos] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [imagen, setImagen] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  // Estados de feedback visual dinámico
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackExito, setFeedbackExito] = useState("");

  const [destinosLista, setDestinosLista] = useState([]);
  const [zonasFiltradasForm, setZonasFiltradasForm] = useState([]);
  const [destinoForm, setDestinoForm] = useState("");
  const [zonaForm, setZonaForm] = useState("");
  const [filtroZonaListado, setFiltroZonaListado] = useState("");
  const [filtroTiempo, setFiltroTiempo] = useState("proximos");

  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL + "/api/destinos")
      .then((res) => res.json())
      .then((data) => { if (data.ok) setDestinosLista(data.datos); })
      .catch((err) => console.error("Error al cargar destinos:", err));
  }, []);

  useEffect(() => {
    if (destinoForm) {
      const encontrado = destinosLista.find(d => d._id === destinoForm);
      setZonasFiltradasForm(encontrado && Array.isArray(encontrado.zonas) ? encontrado.zonas : []);
    } else {
      setZonasFiltradasForm([]);
    }
  }, [destinoForm, destinosLista]);

  const cargarEventosFiltrados = () => {
    if (!destinoActivoId) return;
    let url = `${import.meta.env.VITE_BACKEND_URL}/api/eventos?destino=${destinoActivoId}&tiempo=${filtroTiempo}`;
    if (filtroZonaListado && filtroZonaListado !== "") url += `&zona=${filtroZonaListado}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => { if (data.ok && data.datos) setEventos(data.datos); })
      .catch((err) => console.error("Error al mapear eventos:", err));
  };

  useEffect(() => {
    setFiltroZonaListado("");
    cargarEventosFiltrados();
  }, [destinoActivoId, filtroTiempo]);

  useEffect(() => {
    cargarEventosFiltrados();
  }, [filtroZonaListado]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!esAdmin) return;
    setFeedbackError("");
    setFeedbackExito("");

    if (new Date(fechaInicio) >= new Date(fechaFin)) {
      setFeedbackError("La fecha de inicio debe ser anterior a la de finalización.");
      return;
    }

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);
    formData.append("fecha_hora_inicio", fechaInicio);
    formData.append("fecha_hora_fin", fechaFin);
    formData.append("zona", zonaForm);
    formData.append("usuario", usuario?._id || "ID_DE_PRUEBA");

    if (imagen && typeof imagen !== "string") {
      formData.append("imagen", imagen);
    }

    const urlBase = `${import.meta.env.VITE_BACKEND_URL}/api/eventos`;
    const urlFetch = editandoId ? `${urlBase}/${editandoId}` : urlBase;
    const metodo = editandoId ? "PUT" : "POST";

    fetch(urlFetch, { method: metodo, body: formData })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setFeedbackExito(editandoId ? MensajesSistema.crud.editarExito : MensajesSistema.crud.crearExito);
          cancelarEdicion();
          cargarEventosFiltrados();
          setTimeout(() => setFeedbackExito(""), 4000);
        } else {
          setFeedbackError(data.mensaje || MensajesSistema.crud.errorOperacion);
        }
      })
      .catch(() => setFeedbackError(MensajesSistema.crud.errorRed));
  };

  const handleDelete = (id) => {
    if (!esAdmin) return;
    if (!window.confirm("¿Deseas remover de manera permanente este evento?")) return;
    setFeedbackError("");
    setFeedbackExito("");

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/eventos/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setFeedbackExito(MensajesSistema.crud.eliminarExito);
          if (editandoId === id) cancelarEdicion();
          cargarEventosFiltrados();
          setTimeout(() => setFeedbackExito(""), 4000);
        } else {
          setFeedbackError(data.mensaje || MensajesSistema.crud.errorOperacion);
        }
      })
      .catch(() => setFeedbackError(MensajesSistema.crud.errorRed));
  };

  const formatearParaInput = (stringFecha) => {
    if (!stringFecha) return "";
    const d = new Date(stringFecha);
    const pad = (n) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleEditarClick = (ev) => {
    if (!esAdmin) return;
    setEditandoId(ev._id);
    setTitulo(ev.titulo);
    setFeedbackError(""); // Corregido: Limpia errores al iniciar edición
    setDescripcion(ev.descripcion);
    setFechaInicio(formatearParaInput(ev.fecha_hora_inicio));
    setFechaFin(formatearParaInput(ev.fecha_hora_fin));
    setImagen(ev.imagen); 
    
    const idDestino = ev.zona?.destino?._id || ev.zona?.destino || "";
    setDestinoForm(idDestino);

    const destinoEncontrado = destinosLista.find(d => d._id === idDestino);
    if (destinoEncontrado && Array.isArray(destinoEncontrado.zonas)) {
      setZonasFiltradasForm(destinoEncontrado.zonas); 
    } else {
      setZonasFiltradasForm([]);
    }
    setZonaForm(ev.zona?._id || "");
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setTitulo("");
    setDescripcion("");
    setFechaInicio("");
    setFechaFin("");
    setDestinoForm("");
    setZonaForm("");
    setImagen(null);
    const fileInput = document.getElementById("imagen");
    if (fileInput) fileInput.value = "";
  };

  const obtenerZonasDelDestinoActivo = () => {
    const actual = destinosLista.find(d => d._id === destinoActivoId);
    return actual && Array.isArray(actual.zonas) ? actual.zonas : [];
  };
  return (
    <div className="seccion-lugares" style={!esAdmin ? { gridTemplateColumns: '1fr' } : {}}>
      {/* COLUMNA IZQUIERDA: FORMULARIO */}
      {esAdmin && (
        <section className="panel-formulario" aria-labelledby="titulo-formulario">
          <h2 id="titulo-formulario">{editandoId ? "Modificar Evento" : "Planificar Nuevo Evento"}</h2>
          
          {feedbackError && <div className="alerta-error"><span className="badge-icon">⚠️</span><p>{feedbackError}</p></div>}
          {feedbackExito && <div className="alerta-exito"><span className="badge-icon">✅</span><p>{feedbackExito}</p></div>}

          <form onSubmit={handleSubmit} className="formulario-carga">
            <div className="form-group">
              <label htmlFor="titulo">Título del Evento</label>
              <input id="titulo" type="text" placeholder="Ej. Fiesta de la Tradición" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea id="descripcion" placeholder="Detalles de las actividades..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="fechaInicio">Fecha y Hora de Inicio</label>
              <input id="fechaInicio" type="datetime-local" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="fechaFin">Fecha y Hora de Cierre</label>
              <input id="fechaFin" type="datetime-local" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="destinoForm">Destino Relacionado</label>
              <select id="destinoForm" value={destinoForm} onChange={(e) => { setDestinoForm(e.target.value); setZonaForm(""); }} required>
                <option value="">Seleccione un Destino</option>
                {destinosLista.map(d => <option key={d._id} value={d._id}>{d.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="zonaForm">Zona Específica</label>
              <select id="zonaForm" value={zonaForm} onChange={(e) => setZonaForm(e.target.value)} required disabled={!destinoForm}>
                <option value="">Seleccione una Zona</option>
                {zonasFiltradasForm.map(z => <option key={z._id} value={z._id}>{z.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="imagen">Imagen Informativa</label>
              <input 
                id="imagen" 
                type="file" 
                accept="image/*" 
                /* ⚙️ CORREGIDO: Extrae el archivo individual de la lista */
                onChange={(e) => setImagen(e.target.files[0])} 
              />
            </div>
            <div className="form-acciones">
              <button type="submit" className="btn btn-primario">{editandoId ? "Actualizar" : "Guardar"}</button>
              {editandoId && <button type="button" onClick={cancelarEdicion} className="btn btn-secundario">Cancelar</button>}
            </div>
          </form>
        </section>
      )}

      {/* COLUMNA DERECHA: LISTADO */}
      <section className="panel-listado" aria-labelledby="titulo-listado">
        {!esAdmin && feedbackExito && <div className="alerta-exito"><span className="badge-icon">✅</span><p>{feedbackExito}</p></div>}
        {!esAdmin && feedbackError && <div className="alerta-error"><span className="badge-icon">⚠️</span><p>{feedbackError}</p></div>}

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "15px" }}>
          <div className="filtro-contenedor" style={{ flex: 1, marginBottom: 0 }}>
            <label htmlFor="filtro-zona" className="filtro-label">Zona:</label>
            <select id="filtro-zona" value={filtroZonaListado} onChange={(e) => setFiltroZonaListado(e.target.value)} className="form-select-filtro">
              <option value="">Todas las zonas</option>
              {obtenerZonasDelDestinoActivo().map((z) => <option key={z._id} value={z._id}>{z.nombre}</option>)}
            </select>
          </div>
          <div className="filtro-contenedor" style={{ flex: 1, marginBottom: 0 }}>
            <label htmlFor="filtro-tiempo" className="filtro-label">Cronología:</label>
            <select id="filtro-tiempo" value={filtroTiempo} onChange={(e) => setFiltroTiempo(e.target.value)} className="form-select-filtro">
              <option value="proximos">Próximos y Activos</option>
              <option value="pasados">Eventos Pasados</option>
            </select>
          </div>
        </div>

        <h2 id="titulo-listado">Cronograma de Eventos <span className="contador">({eventos.length})</span></h2>

        {eventos.length === 0 ? (
          <p className="mensaje-vacio">No se encontraron eventos cargados para este criterio.</p>
        ) : (
          <div className="grid-lugares">
            {eventos.map((ev) => {
              const ahora = new Date();
              const estaSucediendo = ahora >= new Date(ev.fecha_hora_inicio) && ahora <= new Date(ev.fecha_hora_fin);
              const esPasado = ahora > new Date(ev.fecha_hora_fin);

              return (
                <article key={ev._id} className="tarjeta-lugar" style={esPasado ? { opacity: 0.75 } : {}}>
                  <div className="tarjeta-imagen-contenedor">
                    {estaSucediendo && <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--danger)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', zIndex: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>🔴 EN VIVO</span>}
                    {esPasado && <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--text-muted)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', zIndex: 2 }}>🏁 FINALIZADO</span>}
                    <img src={`${import.meta.env.VITE_BACKEND_URL}/images/${ev.imagen}`} alt={`Promoción de ${ev.titulo}`} className="tarjeta-img" style={esPasado ? { filter: 'grayscale(60%)' } : {}} />
                  </div>
                  
                  <div className="tarjeta-info">
                    <h3 className="tarjeta-titulo-lugar">{ev.titulo}</h3>
                    <p className="descripcion">{ev.descripcion}</p>
                    <div className="tarjeta-metadatos">
                      <div className="detalles"><span className="badge-icon">📅</span><span className="badge-texto"><strong>Inicio:</strong> {new Date(ev.fecha_hora_inicio).toLocaleString()}</span></div>
                      <div className="detalles"><span className="badge-icon">🏁</span><span className="badge-texto"><strong>Fin:</strong> {new Date(ev.fecha_hora_fin).toLocaleString()}</span></div>
                      <div className="detalles"><span className="badge-icon">🗺️</span><span className="badge-texto">{ev.zona?.destino?.nombre || "Destino"} — {ev.zona?.nombre || "Zona"}</span></div>
                    </div>
                  </div>

                  {esAdmin && (
                    <div className="tarjeta-acciones">
                      <button type="button" onClick={() => handleEditarClick(ev)} className="btn btn-editar">Editar datos</button>
                      <button type="button" onClick={() => handleDelete(ev._id)} className="btn btn-eliminar">Eliminar</button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Eventos;
