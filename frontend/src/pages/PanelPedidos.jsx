// src/pages/PanelPedidos.jsx
import React, { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { obtenerPedidos } from "../services/pedidosServices";
import "../styles/empleadoDashboard.css";

export default function PanelPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerPedidos();

      // ✅ Asegúrate de que sea un array
      const listaPedidos = Array.isArray(data) ? data : [];

      setPedidos(listaPedidos);
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

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const nombre = obtenerNombreCliente(pedido);
    return (
      nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.id.toString().includes(busqueda)
    );
  });

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
        <button className="btn-nuevo" onClick={() => alert("Crear nuevo pedido")}>
          + Nuevo Pedido
        </button>
        <input
          type="text"
          placeholder="🔍 Buscar por cliente o número..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="campo-busqueda"
        />
      </div>

      {loading ? (
        <p className="cargando">Cargando pedidos...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : pedidosFiltrados.length === 0 ? (
        <p className="vacio">No se encontraron pedidos.</p>
      ) : (
        <table className="tabla-pedidos">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.id}</td>
                <td>{obtenerNombreCliente(pedido)}</td>
                <td>
                  <span className={`badge badge-${pedido.estado}`}>
                    {pedido.estado}
                  </span>
                </td>
                <td>{formatearFecha(pedido.fecha_creacion)}</td>
                <td className="acciones-horizontal">
                  <button className="btn-accion btn-ver">👁️ Ver</button>
                  <button className="btn-accion btn-editar">✏️ Editar</button>
                  <button className="btn-accion btn-eliminar">❌ Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}