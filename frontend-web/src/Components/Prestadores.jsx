import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { MensajesSistema } from "../context/MensajesSistema";

function Prestadores({ destinoActivoId }) {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  const [prestadores, setPrestadores] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
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

  const cargarPrestadoresFiltrados = () => {
    if (!destinoActivoId) return;
    let url = `${import.meta.env.VITE_BACKEND_URL}/api/prestadores?destino=${destinoActivoId}`;
    if (filtroZonaListado && filtroZonaListado !== "") url += `&zona=${filtroZonaListado}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => { if (data.ok) setPrestadores(data.datos); })
      .catch((err) => console.error("Error al mapear prestadores:", err));
  };

  useEffect(() => {
    setFiltroZonaListado("");
    cargarPrestadoresFiltrados();
  }, [destinoActivoId]);

  useEffect(() => {
    cargarPrestadoresFiltrados();
  }, [filtroZonaListado]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!esAdmin) return;
    setFeedbackError("");
    setFeedbackExito("");

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);
    formData.append("categoria", categoria);
    formData.append("zona", zonaForm);
    formData.append("usuario", usuario?._id || "ID_DE_PRUEBA");

    if (imagen && typeof imagen !== "string") {
      formData.append("imagen", imagen);
    }

    const urlBase = `${import.meta.env.VITE_BACKEND_URL}/api/prestadores`;
    const urlFetch = editandoId ? `${urlBase}/${editandoId}` : urlBase;
    const metodo = editandoId ? "PUT" : "POST";

    fetch(urlFetch, { method: metodo, body: formData })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setFeedbackExito(editandoId ? MensajesSistema.crud.editarExito : MensajesSistema.crud.crearExito);
          cancelarEdicion();
          cargarPrestadoresFiltrados();
          setTimeout(() => setFeedbackExito(""), 4000);
        } else {
          setFeedbackError(data.mensaje || MensajesSistema.crud.errorOperacion);
        }
      })
      .catch(() => setFeedbackError(MensajesSistema.crud.errorRed));
  };

  const handleDelete = (id) => {
    if (!esAdmin) return;
    if (!window.confirm("¿Remover prestador de servicios?")) return;
    setFeedbackError("");
    setFeedbackExito("");

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/prestadores/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setFeedbackExito(MensajesSistema.crud.eliminarExito);
          if (editandoId === id) cancelarEdicion();
          cargarPrestadoresFiltrados();
          setTimeout(() => setFeedbackExito(""), 4000);
        } else {
          setFeedbackError(data.mensaje || MensajesSistema.crud.errorOperacion);
        }
      })
      .catch(() => setFeedbackError(MensajesSistema.crud.errorRed));
  };

  const handleEditarClick = (p) => {
    if (!esAdmin) return;
    setEditandoId(p._id);
    setTitulo(p.titulo);
    setFeedbackError("");
    setDescripcion(p.descripcion);
    setCategoria(p.categoria);
    
    const idDestino = p.zona?.destino?._id || p.zona?.destino || "";
    setDestinoForm(idDestino);

    const destinoEncontrado = destinosLista.find(d => d._id === idDestino);
    if (destinoEncontrado && Array.isArray(destinoEncontrado.zonas)) {
      setZonasFiltradasForm(destinoEncontrado.zonas); 
    } else {
      setZonasFiltradasForm([]);
    }
    setZonaForm(p.zona?._id || "");
    setImagen(p.imagen);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setTitulo("");
    setDescripcion("");
    setCategoria("");    
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
      {/* SECCIÓN IZQUIERDA: FORMULARIO */}
      {esAdmin && (
        <section className="panel-formulario">
          <h2>{editandoId ? "Modificar Prestador" : "Registrar Nuevo Prestador"}</h2>
          
          {feedbackError && <div className="alerta-error"><span className="badge-icon">⚠️</span><p>{feedbackError}</p></div>}
          {feedbackExito && <div className="alerta-exito"><span className="badge-icon">✅</span><p>{feedbackExito}</p></div>}

          <form onSubmit={handleSubmit} className="formulario-carga">
            <div className="form-group">
              <label htmlFor="titulo">Nombre / Título Comercial</label>
              <input id="titulo" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="descripcion">Descripción del Servicio</label>
              <textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="categoria">Categoría</label>
              <select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
                <option value="">Seleccione Categoría</option>
                <option value="Gastronomia">Gastronomía</option>
                <option value="Alojamiento">Alojamiento y Hospedaje</option>
                <option value="Guiado">Excursiones y Guiados</option>
                <option value="Supermercado">Supermercado</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="destinoForm">Destino</label>
              <select id="destinoForm" value={destinoForm} onChange={(e) => { setDestinoForm(e.target.value); setZonaForm(""); }} required>
                <option value="">Seleccione Destino</option>
                {destinosLista.map(d => <option key={d._id} value={d._id}>{d.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="zonaForm">Zona</label>
              <select id="zonaForm" value={zonaForm} onChange={(e) => setZonaForm(e.target.value)} required disabled={!destinoForm}>
                <option value="">Seleccione Zona</option>
                {zonasFiltradasForm.map(z => <option key={z._id} value={z._id}>{z.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="imagen">Imagen Comercial</label>
              <input 
                id="imagen" 
                type="file" 
                accept="image/*" 
                /* ⚙️ CORREGIDO: Extrae el archivo individual de la lista en lugar del objeto iterable completo */
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

      {/* SECCIÓN DERECHA: LISTADO */}
      <section className="panel-listado" aria-labelledby="titulo-listado">
        {!esAdmin && feedbackExito && <div className="alerta-exito"><span className="badge-icon">✅</span><p>{feedbackExito}</p></div>}
        {!esAdmin && feedbackError && <div className="alerta-error"><span className="badge-icon">⚠️</span><p>{feedbackError}</p></div>}

        <div className="filtro-contenedor" style={{ marginBottom: "15px" }}>
          <label htmlFor="filtro-zona" className="filtro-label">Filtrar por zona:</label>
          <select id="filtro-zona" value={filtroZonaListado} onChange={(e) => setFiltroZonaListado(e.target.value)} className="form-select-filtro">
            <option value="">Todas las zonas</option>
            {obtenerZonasDelDestinoActivo().map((z) => <option key={z._id} value={z._id}>{z.nombre}</option>)}
          </select>
        </div>

        <h2 id="titulo-listado">Listado de Prestadores <span className="contador">({prestadores.length})</span></h2>

        {prestadores.length === 0 ? (
          <p className="mensaje-vacio">No se encontraron prestadores cargados para este destino o zona.</p>
        ) : (
          <div className="grid-lugares">
            {prestadores.map((p) => (
              <article key={p._id} className="tarjeta-lugar">
                <div className="tarjeta-imagen-contenedor">
                  <img src={`${import.meta.env.VITE_BACKEND_URL}/images/${p.imagen}`} alt={`Fotografía de ${p.titulo}`} className="tarjeta-img" />
                </div>
                
                <div className="tarjeta-info">
                  <h3 className="tarjeta-titulo-lugar">{p.titulo}</h3>
                  <p className="descripcion">{p.descripcion}</p>
                  <div className="tarjeta-metadatos">
                    <div className="detalles"><span className="badge-icon">🏷️</span><span className="badge-texto" style={{ fontWeight: '600' }}>{p.categoria}</span></div>
                    <div className="detalles"><span className="badge-icon">🗺️</span><span className="badge-texto">{p.zona?.destino?.nombre || "Destino"} — {p.zona?.nombre || "Zona"}</span></div>
                  </div>
                </div>

                {esAdmin && (
                  <div className="tarjeta-acciones">
                    <button type="button" onClick={() => handleEditarClick(p)} className="btn btn-editar">Editar datos</button>
                    <button type="button" onClick={() => handleDelete(p._id)} className="btn btn-eliminar">Eliminar</button>
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

export default Prestadores;
