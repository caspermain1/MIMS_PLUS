// src/pages/EmpleadoDashboard.jsx
import React, { useState, useEffect } from "react";
import { Pill, FileText, Package, TrendingUp, AlertCircle } from "lucide-react";
import MedicamentosEmpleado from "./medicamentosEmpleado";
import PanelFactura from "./panelFactura";
import PanelPedidos from "./PanelPedidos";
import "../styles/empleadoDashboard.css";
import axios from "axios";

export default function EmpleadoDashboard() {
  const [seccionActual, setSeccionActual] = useState("medicamentos");
  const [stats, setStats] = useState({
    totalPedidos: 0,
    pendientes: 0,
    facturados: 0,
    medicamentosVencidos: 0,
    stockBajo: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Cargar estadísticas desde los endpoints
      const [pedidos, facturas, medicamentos] = await Promise.all([
        axios.get("http://localhost:8000/api/pedidos/crud/", config).catch(() => ({ data: [] })),
        axios.get("http://localhost:8000/api/facturas/facturas/", config).catch(() => ({ data: [] })),
        axios.get("http://localhost:8000/api/inventario/medicamentos-crud/").catch(() => ({ data: [] })),
      ]);

      const pedidosData = pedidos.data || [];
      const facturasData = facturas.data || [];
      const medicamentosData = medicamentos.data || [];

      setStats({
        totalPedidos: pedidosData.length,
        pendientes: pedidosData.filter((p) => p.estado === "pendiente").length,
        facturados: facturasData.length,
        medicamentosVencidos: medicamentosData.filter(
          (m) => m.fecha_vencimiento && new Date(m.fecha_vencimiento) < new Date()
        ).length,
        stockBajo: medicamentosData.filter((m) => m.stock_actual < m.stock_minimo).length,
      });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const secciones = [
    { id: "medicamentos", nombre: "Medicamentos", icono: <Pill size={20} /> },
    { id: "facturas", nombre: "Facturas", icono: <FileText size={20} /> },
    { id: "pedidos", nombre: "Pedidos", icono: <Package size={20} /> },
  ];

  return (
    <div className="empleado-dashboard flex bg-[#f5f3ff]">
      <aside className="sidebar w-72 bg-gradient-to-b from-[#4c1d95] to-[#7c3aed] text-white p-6 min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Droguería MIMS</h1>
          <p className="text-sm text-purple-200 mt-1">Panel Empleado</p>
        </div>

        {/* Widget de estadísticas */}
        {!loading && (
          <div className="mb-8 bg-white/10 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Package size={16} />
              <span className="text-sm">Pedidos: <strong>{stats.totalPedidos}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span className="text-sm">Pendientes: <strong>{stats.pendientes}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} />
              <span className="text-sm">Facturados: <strong>{stats.facturados}</strong></span>
            </div>
            {stats.medicamentosVencidos > 0 && (
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle size={16} />
                <span className="text-sm">Vencidos: <strong>{stats.medicamentosVencidos}</strong></span>
              </div>
            )}
            {stats.stockBajo > 0 && (
              <div className="flex items-center gap-2 text-yellow-300">
                <AlertCircle size={16} />
                <span className="text-sm">Stock bajo: <strong>{stats.stockBajo}</strong></span>
              </div>
            )}
          </div>
        )}

        <nav className="flex-1 space-y-2">
          {secciones.map((seccion) => (
            <button
              key={seccion.id}
              onClick={() => setSeccionActual(seccion.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition ${
                seccionActual === seccion.id ? "bg-white/10" : ""
              }`}
            >
              {seccion.icono}
              <span>{seccion.nombre}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={cargarEstadisticas}
          className="w-full mt-4 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition"
        >
          🔄 Actualizar estadísticas
        </button>
      </aside>

      <main className="flex-1 p-8">
        <div className="panel-empleado max-w-none">
          {seccionActual === "medicamentos" && <MedicamentosEmpleado />}
          {seccionActual === "facturas" && <PanelFactura />}
          {seccionActual === "pedidos" && <PanelPedidos />}
        </div>
      </main>
    </div>
  );
}