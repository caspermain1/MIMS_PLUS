// src/pages/PanelPedidos.jsx
import React, { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { obtenerPedidos } from "../services/pedidosServices";
import "../styles/empleadoDashboard.css";

export default function PanelPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState(""); // Filtro por estado
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarPedidos();
  }, []);

  useEffect(() => {
    // Debounce para búsqueda
    const t = setTimeout(() => cargarPedidos(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, estadoFiltro, page]);

  const cargarPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerPedidos();

      // ✅ Asegúrate de que sea un array
      let listaPedidos = Array.isArray(data) ? data : [];

      // Aplicar filtros localmente (si no está implementado en backend)
      if (busqueda) {
        listaPedidos = listaPedidos.filter((p) => {
          const nombre = obtenerNombreCliente(p);
          return (
            nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.id.toString().includes(busqueda)
          );
        });
      }

      if (estadoFiltro) {
        listaPedidos = listaPedidos.filter((p) => p.estado === estadoFiltro);
      }

      // Aplicar paginación
      const inicio = (page - 1) * pageSize;
      const fin = inicio + pageSize;
      const paginados = listaPedidos.slice(inicio, fin);

      setPedidos(paginados);
      setTotalCount(listaPedidos.length);
    } catch (e) {
      console.error("Error al cargar pedidos:", e);
      setError("Error del servidor. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Extrae el nombre del cliente de forma segura
  const obtenerNombreCliente = (pedido) => {
    if (typeof pedido.cliente === "string") {
      return pedido.cliente;
    }
    if (pedido.cliente && typeof pedido.cliente === "object") {
      return pedido.cliente.username || "Cliente";
    }
    return "Cliente";
  };

  // ✅ Formatea la fecha sin errores
  const formatearFecha = (fecha) => {
    if (!fecha) return "–";
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? "Fecha inválida" : d.toLocaleString();
  };

  // Estados disponibles
  const estados = ["pendiente", "confirmado", "enviado", "entregado", "cancelado"];

  return (
    <div className="panel-pedidos">
      <div className="cabecera">
        <h2>
          <ClipboardList className="cabecera-icon" /> Panel de Pedidos
        </h2>
        <button className="btn-refresh" onClick={cargarPedidos}>
          Actualizar
        </button>
      </div>

      <div className="acciones-superiores">
        <input
          type="text"
          placeholder="🔍 Buscar por cliente o número..."
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
          className="campo-busqueda"
        />
        <select
          value={estadoFiltro}
          onChange={(e) => { setEstadoFiltro(e.target.value); setPage(1); }}
          className="campo-busqueda"
        >
          <option value="">Todos los estados</option>
          {estados.map((est) => (
            <option key={est} value={est}>
              {est.charAt(0).toUpperCase() + est.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="cargando">Cargando pedidos...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : pedidos.length === 0 ? (
        <p className="vacio">No se encontraron pedidos.</p>
      ) : (
        <>
          <table className="tabla-pedidos">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td>{pedido.id}</td>
                  <td>{obtenerNombreCliente(pedido)}</td>
                  <td>${pedido.total?.toLocaleString("es-CO") || "–"}</td>
                  <td>
                    <span className={`badge badge-${pedido.estado}`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td>{formatearFecha(pedido.fecha_creacion)}</td>
                  <td className="acciones-horizontal">
                    <button className="btn-accion btn-ver">👁️ Ver</button>
                    <button className="btn-accion btn-editar">✏️ Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          {totalCount !== null && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-slate-600">
                Mostrando {(page - 1) * pageSize + 1} -{" "}
                {Math.min(page * pageSize, totalCount)} de {totalCount} pedidos
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                <span className="px-3 py-1">Página {page}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={totalCount ? page * pageSize >= totalCount : false}
                  className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}