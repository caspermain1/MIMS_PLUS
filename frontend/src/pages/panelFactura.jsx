import React, { useState, useEffect } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import { Download, Eye, Edit, Trash2 } from "lucide-react";
import "../styles/empleadoDashboard.css";

export default function PanelFactura() {
  const [clientes, setClientes] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  const [factura, setFactura] = useState({
    id: null,
    cliente: "",
    metodo_pago: "",
    direccion_entrega: "",
    observaciones: "",
    total: 0,
    detalles: [],
  });

  useEffect(() => {
    cargarClientes();
    cargarFacturas();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => cargarFacturas(), 300);
    return () => clearTimeout(t);
  }, [page, busqueda, filtroEstado, fechaInicio, fechaFin]);

  const cargarClientes = async () => {
    try {
      const res = await API.get("/usuarios/usuarios/");
      setClientes(res.data);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
    }
  };

  const cargarFacturas = async () => {
    setLoading(true);
    try {
      const res = await API.get("/facturas/facturas/");
      let allFacturas = res.data || [];

      // Filtrar por búsqueda
      if (busqueda) {
        allFacturas = allFacturas.filter((f) =>
          f.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          f.id.toString().includes(busqueda)
        );
      }

      // Filtrar por estado
      if (filtroEstado !== "todos") {
        allFacturas = allFacturas.filter((f) => f.estado === filtroEstado);
      }

      // Filtrar por rango de fechas
      if (fechaInicio) {
        allFacturas = allFacturas.filter((f) => new Date(f.fecha_emision) >= new Date(fechaInicio));
      }
      if (fechaFin) {
        allFacturas = allFacturas.filter((f) => new Date(f.fecha_emision) <= new Date(fechaFin));
      }

      setTotalCount(allFacturas.length);

      // Aplicar paginación
      const inicio = (page - 1) * pageSize;
      const fin = inicio + pageSize;
      setFacturas(allFacturas.slice(inicio, fin));
    } catch (err) {
      console.error("Error al cargar facturas:", err);
      mostrarMensaje("❌ Error al cargar facturas", "error");
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (msg, tipo = "success") => {
    setMensaje(msg);
    setTipoMensaje(tipo);
    setTimeout(() => setMensaje(""), 3000);
  };

  const handleCrearFactura = () => {
    setFactura({
      id: null,
      cliente: "",
      metodo_pago: "efectivo",
      direccion_entrega: "",
      observaciones: "",
      total: 0,
      detalles: [],
    });
    mostrarMensaje("✅ Inicia el proceso de creación de una nueva factura.", "success");
  };

  const handleVerFactura = (f) => {
    setFacturaSeleccionada(f);
    setMostrarModal(true);
  };

  const handleDescargarFactura = (factura) => {
    mostrarMensaje(`📥 Descargando factura #${factura.id}...`, "success");
  };

  const handleEliminarFactura = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta factura?")) {
      try {
        await API.delete(`/facturas/facturas/${id}/`);
        mostrarMensaje("✅ Factura eliminada correctamente", "success");
        cargarFacturas();
      } catch (err) {
        mostrarMensaje("❌ Error al eliminar la factura", "error");
      }
    }
  };

  return (
    <div className="panel-factura p-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-6 text-slate-800"
      >
        Gestión de Facturas
      </motion.h2>

      {mensaje && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-4 rounded-lg mb-4 ${tipoMensaje === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {mensaje}
        </motion.div>
      )}

      <div className="acciones-superiores mb-6 space-y-4">
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          onClick={handleCrearFactura}
        >
          + Crear Factura
        </button>

        <input
          type="text"
          placeholder="🔍 Buscar por cliente o número..."
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
          className="w-full px-4 py-2 border rounded-lg"
        />

        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setPage(1); }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagada">Pagada</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => { setFechaInicio(e.target.value); setPage(1); }}
            className="px-4 py-2 border rounded-lg"
          />

          <input
            type="date"
            value={fechaFin}
            onChange={(e) => { setFechaFin(e.target.value); setPage(1); }}
            className="px-4 py-2 border rounded-lg"
          />

          <button
            onClick={() => {
              setBusqueda("");
              setFiltroEstado("todos");
              setFechaInicio("");
              setFechaFin("");
              setPage(1);
            }}
            className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200"
          >
            Reset
          </button>
        </div>

        <div className="text-sm text-slate-600">
          Total: {totalCount} factura{totalCount !== 1 ? "s" : ""}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Cargando facturas...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-left">Método</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturas.length > 0 ? (
                  facturas.map((f) => (
                    <tr key={f.id} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-2 font-semibold">{f.id}</td>
                      <td className="px-4 py-2">{f.cliente_nombre}</td>
                      <td className="px-4 py-2 capitalize">{f.metodo_pago}</td>
                      <td className="px-4 py-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          f.estado === "pagada" ? "bg-green-100 text-green-700" :
                          f.estado === "pendiente" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {f.estado?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">${f.total}</td>
                      <td className="px-4 py-2">{new Date(f.fecha_emision).toLocaleDateString("es-CO")}</td>
                      <td className="px-4 py-2">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleVerFactura(f)}
                            className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDescargarFactura(f)}
                            className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                            title="Descargar PDF"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleEliminarFactura(f.id)}
                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-600">
                      No hay facturas que coincidan con tu búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalCount > pageSize && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                ← Anterior
              </button>
              <span className="px-4 py-2">
                Página {page} de {Math.ceil(totalCount / pageSize)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(totalCount / pageSize)}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal para ver detalles */}
      {mostrarModal && facturaSeleccionada && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setMostrarModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Detalles de la Factura #{facturaSeleccionada.id}</h3>
            <div className="space-y-3 text-sm">
              <p><strong>Cliente:</strong> {facturaSeleccionada.cliente_nombre}</p>
              <p><strong>Método:</strong> {facturaSeleccionada.metodo_pago}</p>
              <p><strong>Estado:</strong> {facturaSeleccionada.estado}</p>
              <p><strong>Dirección:</strong> {facturaSeleccionada.direccion_entrega || "N/A"}</p>
              <p><strong>Fecha:</strong> {new Date(facturaSeleccionada.fecha_emision).toLocaleDateString("es-CO")}</p>
              <p><strong>Total:</strong> ${facturaSeleccionada.total}</p>
              
              {facturaSeleccionada.detalles && facturaSeleccionada.detalles.length > 0 && (
                <div className="mt-4">
                  <strong>Detalles:</strong>
                  <ul className="mt-2 text-xs space-y-1">
                    {facturaSeleccionada.detalles.map((d, i) => (
                      <li key={i} className="bg-slate-100 p-2 rounded">
                        {d.medicamento}: {d.cantidad}x ${d.precio_unitario} = ${d.subtotal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => setMostrarModal(false)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Cerrar
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
