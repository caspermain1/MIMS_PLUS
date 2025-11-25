// src/pages/Catalogo.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  getCategoriasConMedicamentos,
  getCatalogo,
  getProveedores,
  getDrogueriasPublic,
} from "../services/inventarioServices.js";
import "./CatalogoMedicamentos.css";

const Catalogo = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
    // catalogo servidor
    const [productos, setProductos] = useState([]);
    const [catLoading, setCatLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(9);
    const [totalCount, setTotalCount] = useState(null);

    const [proveedorQ, setProveedorQ] = useState("");
    const [proveedoresOpt, setProveedoresOpt] = useState([]);
    const [proveedorSelected, setProveedorSelected] = useState("");

    const [droguerias, setDroguerias] = useState([]);
    const [drogueriaSelected, setDrogueriaSelected] = useState("");

    const [precioMin, setPrecioMin] = useState("");
    const [precioMax, setPrecioMax] = useState("");
    const [disponibleOnly, setDisponibleOnly] = useState(false);
    const [vencidoOnly, setVencidoOnly] = useState(false);

    const provDebounce = useRef(null);
  const [error, setError] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [categoriaInicio, setCategoriaInicio] = useState(0); // Índice inicial para mostrar categorías

  const CATEGORIAS_VISIBLES = 5; // Número de categorías visibles a la vez

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const catConMed = await getCategoriasConMedicamentos();
        setCategorias(catConMed);
        if (catConMed.length > 0) setCategoriaActiva(catConMed[0].id); // Primera categoría activa por defecto
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("No se pudieron cargar los datos del catálogo");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();

    // cargar droguerias públicas para selector
    getDrogueriasPublic().then((r) => setDroguerias(r)).catch(() => setDroguerias([]));
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Cargando catálogo...</p>;
  if (error) return <p className="error">{error}</p>;

  const manejarClickCategoria = (id) => {
    setCategoriaActiva(id);
    // reset página al cambiar categoría
    setPage(1);
    fetchCatalogo({ categoria: id, page: 1 });
  };

  const categoriaSeleccionada = categorias.find((cat) => cat.id === categoriaActiva);

  const moverCategoriasIzquierda = () => {
    if (categoriaInicio > 0) setCategoriaInicio(categoriaInicio - 1);
  };

  const moverCategoriasDerecha = () => {
    if (categoriaInicio + CATEGORIAS_VISIBLES < categorias.length) {
      setCategoriaInicio(categoriaInicio + 1);
    }
  };

  // ==========================
  // Catalogo: funciones de fetch y proveedores
  // ==========================
  const fetchCatalogo = async (extraParams = {}) => {
    setCatLoading(true);
    try {
      const params = { page, page_size: pageSize, categoria: categoriaActiva, proveedor: proveedorSelected };
      if (precioMin) params.precio_min = precioMin;
      if (precioMax) params.precio_max = precioMax;
      if (drogueriaSelected) params.drogueria = drogueriaSelected;
      if (disponibleOnly) params.disponible = true;
      if (vencidoOnly) params.vencido = true;
      // merge extras
      Object.assign(params, extraParams);

      const res = await getCatalogo(params);
      if (res && res.results) {
        setProductos(res.results);
        setTotalCount(res.count);
      } else {
        setProductos(res || []);
        setTotalCount(null);
      }
    } catch (e) {
      console.error('Error fetch catalogo', e);
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => {
    // refrescar catálogo cuando cambien filtros o página
    fetchCatalogo({ page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaActiva, proveedorSelected, drogueriaSelected, precioMin, precioMax, disponibleOnly, vencidoOnly, page]);

  const handleProveedorInput = (q) => {
    setProveedorQ(q);
    if (provDebounce.current) clearTimeout(provDebounce.current);
    provDebounce.current = setTimeout(async () => {
      if (!q) return setProveedoresOpt([]);
      try {
        const res = await getProveedores(q, 1, 10);
        const items = res.results || res;
        setProveedoresOpt(items);
      } catch (e) {
        console.error('Error proveedores', e);
      }
    }, 300);
  };


  return (
    <div className="catalogo-container">
      {/* Botones de categorías con navegación */}
      <div className="categorias-botones">
        <button className="flecha-boton" onClick={moverCategoriasIzquierda}>
          &lt;&lt;
        </button>
        {categorias
          .slice(categoriaInicio, categoriaInicio + CATEGORIAS_VISIBLES)
          .map((cat) => (
            <button
              key={cat.id}
              className={`categoria-boton ${cat.id === categoriaActiva ? "activa" : ""}`}
              onClick={() => manejarClickCategoria(cat.id)}
            >
              {cat.nombre}
            </button>
          ))}
        <button className="flecha-boton" onClick={moverCategoriasDerecha}>
          &gt;&gt;
        </button>
      </div>

      {/* Cuadro de descripción de la categoría */}
      {categoriaSeleccionada && (
        <div className="descripcion-dialogo">
          <h2>{categoriaSeleccionada.nombre}</h2>
          <p>{categoriaSeleccionada.descripcion || "Sin descripción"}</p>
        </div>
      )}

      {/* Controles del catálogo (búsqueda avanzada) */}
      <section className="catalogo-filtros max-w-6xl mx-auto px-4 py-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input placeholder="Buscar por nombre (q)" className="p-2 border rounded" value={proveedorQ ? '' : ''} onChange={()=>{}} style={{display:'none'}} />
          <div className="flex items-center gap-2">
            <input
              placeholder="Proveedor (autocompletar)"
              className="p-2 border rounded w-60"
              value={proveedorQ}
              onChange={(e) => handleProveedorInput(e.target.value)}
            />
            <div className="relative">
              {proveedoresOpt.length > 0 && (
                <ul className="absolute bg-white shadow rounded mt-1 max-h-40 overflow-auto w-60 z-40">
                  {proveedoresOpt.map((p, i) => (
                    <li
                      key={i}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => { setProveedorSelected(p); setProveedorQ(p); setProveedoresOpt([]); setPage(1); }}
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <select value={drogueriaSelected} onChange={(e) => { setDrogueriaSelected(e.target.value); setPage(1); }} className="p-2 border rounded">
            <option value="">Todas las droguerías</option>
            {droguerias.map((d) => (<option key={d.id} value={d.id}>{d.nombre}</option>))}
          </select>

          <input placeholder="Precio min" className="p-2 border rounded w-28" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} />
          <input placeholder="Precio max" className="p-2 border rounded w-28" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} />

          <label className="flex items-center gap-2"><input type="checkbox" checked={disponibleOnly} onChange={(e) => setDisponibleOnly(e.target.checked)} /> Sólo disponibles</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={vencidoOnly} onChange={(e) => setVencidoOnly(e.target.checked)} /> Vencidos</label>

          <div className="ml-auto flex gap-2 items-center">
            <button onClick={() => { setProveedorSelected(''); setProveedorQ(''); setPage(1); setPrecioMin(''); setPrecioMax(''); setDrogueriaSelected(''); setDisponibleOnly(false); setVencidoOnly(false); }} className="px-3 py-1 border rounded">Reset</button>
          </div>

        </div>
      </section>

      {/* Medicamentos de la categoría seleccionada o resultados del catálogo servidor */}
      {categoriaSeleccionada || productos.length ? (
        <section className="categoria-seccion">
          <div className="medicamentos-grid">
            {catLoading ? (
              <p>Cargando resultados...</p>
            ) : productos.length > 0 ? (
              productos.map((med) => (
                <div key={med.id} className="medicamento-card">
                  <img src={med.imagen_url || '/images/default-image.png'} alt={med.nombre} />
                  <h3>{med.nombre}</h3>
                  <p>{med.descripcion ? med.descripcion.substring(0, 100) + "..." : "Sin descripción"}</p>
                  <p className="precio">Precio: ${med.precio_venta}</p>
                  <div className="badges mt-2 flex gap-2">
                    {med.fecha_vencimiento && new Date(med.fecha_vencimiento) < new Date() ? (
                      <span className="badge-danger">Vencido</span>
                    ) : med.stock_disponible > 0 ? (
                      <span className="badge-success">Disponible</span>
                    ) : (
                      <span className="badge-warning">Agotado</span>
                    )}
                    {med.proveedor && <span className="badge-info">{med.proveedor}</span>}
                  </div>
                </div>
              ))
            ) : categoriaSeleccionada && categoriaSeleccionada.medicamentos && categoriaSeleccionada.medicamentos.length > 0 ? (
              categoriaSeleccionada.medicamentos.map((med) => (
                <div key={med.id} className="medicamento-card">
                  <img
                    src={med.imagen_url || '/images/default-image.png'}
                    alt={med.nombre}
                  />
                  <h3>{med.nombre}</h3>
                  <p>{med.descripcion ? med.descripcion.substring(0, 100) + "..." : "Sin descripción"}</p>
                  <p className="precio">Precio: ${med.precio_venta}</p>
                </div>
              ))
            ) : (
              <p>No hay medicamentos en esta categoría.</p>
            )}
          </div>
        </section>
        ) : (
        <p>No hay categorías disponibles.</p>
      )}

      {/* Paginación para resultados del catálogo */}
      {totalCount !== null && (
        <div className="pagination-controls max-w-6xl mx-auto px-4 py-4">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded mr-2">Anterior</button>
          <span>Página {page} de {Math.ceil(totalCount / pageSize)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(totalCount / pageSize)} className="px-3 py-1 border rounded ml-2">Siguiente</button>
        </div>
      )}
    </div>
  );
};

export default Catalogo;
