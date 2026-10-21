import { useEffect, useState } from "react";

function Lugares({ destinoActivoId }) {
  const [lugares, setLugares] = useState([]);  
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [horario, setHorario] = useState("");
  const [imagen, setImagen] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  // Estados para el manejo de relaciones jerárquicas dinámicas con el Backend
  const [destinosLista, setDestinosLista] = useState([]); // Listado total de destinos
  const [zonasFiltradasForm, setZonasFiltradasForm] = useState([]); // Zonas del destino seleccionado en el Form
  const [destinoForm, setDestinoForm] = useState(""); // Destino activo en el formulario
  const [zonaForm, setZonaForm] = useState("");       // Zona activa en el formulario
  const [filtroZonaListado, setFiltroZonaListado] = useState(""); // Criterio de filtro para el listado

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
      setZonasFiltradasForm(destinoEncontrado ? destinoEncontrado.zonas : []);
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
    setFiltroZonaListado(""); // Limpiar filtros de zona previos al alternar de región
    cargarLugaresEnBaseAFiltros();
  }, [destinoActivoId]);

  // Sincronizar listado cuando se alterne el filtro por zona específica
  useEffect(() => {
    cargarLugaresEnBaseAFiltros();
  }, [filtroZonaListado]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("destino", destinoForm); // Cambiado de ubicacion a destino ID
    formData.append("zona", zonaForm);       // Agregado zona ID obligatorio
    formData.append("horario", horario);
    
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

  const handleEditarClick = (lugar) => {
    setEditandoId(lugar._id);
    setNombre(lugar.nombre);
    setDescripcion(lugar.descripcion);
    setHorario(lugar.horario);
    setImagen(lugar.imagen);
    setDestinoForm(lugar.destino?._id || "");
    setZonaForm(lugar.zona?._id || "");
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

          {/* NUEVO CAMPO: SELECCIÓN DE DESTINO EN FORMULARIO */}
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

          {/* NUEVO CAMPO: SELECCIÓN DE ZONA EN FORMULARIO (DINÁMICA) */}
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
        {/* FILTRO DINÁMICO TOTALMENTE SINCRONIZADO AL DESTINO DEL HEADER */}
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
{lugar.nombre}
{lugar.descripcion}
🗺️
{/* Corregido el renderizado de la relación poblada del Backend */}

{lugar.destino?.nombre} — {lugar.zona?.nombre}



🕒
{lugar.horario}


<button type="button" onClick={() => handleEditarClick(lugar)} className="btn btn-editar">Editar datos</button>

<button type="button" onClick={() => handleDelete(lugar._id)} className="btn btn-eliminar">Eliminar</button>
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

