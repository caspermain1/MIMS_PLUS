// src/pages/EmpleadoDashboard.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pill, FileText, Package, TrendingUp, AlertCircle, RefreshCw, BarChart3, Clock } from "lucide-react";
import MedicamentosEmpleado from "./medicamentosEmpleado";
import PanelFactura from "./panelFactura";
import PanelPedidos from "./PanelPedidos";
import "../styles/empleadoDashboard.css";
import axios from "axios";

export default function EmpleadoDashboard() {
  const [seccionActual, setSeccionActual] = useState("dashboard");
  const [stats, setStats] = useState({
    totalPedidos: 0,
    pendientes: 0,
    facturados: 0,
    medicamentosVencidos: 0,
    stockBajo: 0,
    ventasHoy: 0,
    ultimaActualizacion: null,
  });
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    cargarEstadisticas();
    const interval = setInterval(cargarEstadisticas, 5 * 60 * 1000); // Actualizar cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  const cargarEstadisticas = async () => {
    setActualizando(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

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
        stockBajo: medicamentosData.filter((m) => m.stock_actual <= 10).length,
        ventasHoy: facturasData.filter((f) => {
          const today = new Date().toDateString();
          return new Date(f.fecha_emision).toDateString() === today;
        }).length,
        ultimaActualizacion: new Date().toLocaleTimeString("es-CO"),
      });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
      setActualizando(false);
    }
  };

  const secciones = [
    { id: "dashboard", nombre: "Dashboard", icono: <BarChart3 size={20} /> },
    { id: "medicamentos", nombre: "Medicamentos", icono: <Pill size={20} /> },
    { id: "facturas", nombre: "Facturas", icono: <FileText size={20} /> },
    { id: "pedidos", nombre: "Pedidos", icono: <Package size={20} /> },
  ];

  const CardEstadistica = ({ icon, titulo, valor, subtitulo, color, isAlert }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-6 text-white shadow-lg ${
        isAlert
          ? "bg-gradient-to-br from-red-500 to-red-600"
          : `bg-gradient-to-br ${color}`
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{titulo}</p>
          <p className="text-3xl font-bold mt-2">{valor}</p>
          {subtitulo && <p className="text-xs opacity-75 mt-1">{subtitulo}</p>}
        </div>
        <div className="opacity-30">{icon}</div>
      </div>
    </motion.div>
  );

  return (
    <div className="empleado-dashboard flex bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      <aside className="sidebar w-72 bg-gradient-to-b from-purple-700 via-purple-800 to-indigo-900 text-white p-6 min-h-screen shadow-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Droguería MIMS</h1>
          <p className="text-sm text-purple-200 mt-1">Panel Empleado</p>
          {stats.ultimaActualizacion && (
            <p className="text-xs text-purple-300 mt-2 flex items-center gap-1">
              <Clock size={12} /> Actualizado: {stats.ultimaActualizacion}
            </p>
          )}
        </div>

        {/* Widget de estadísticas mini */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 bg-white/10 backdrop-blur rounded-lg p-4 space-y-3 border border-white/20"
          >
            <h3 className="text-sm font-semibold text-purple-100 mb-3">📊 Resumen</h3>
            
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Package size={16} />
                <span className="text-sm">Pedidos</span>
              </div>
              <span className="font-bold text-lg">{stats.totalPedidos}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText size={16} />
                <span className="text-sm">Facturas Hoy</span>
              </div>
              <span className="font-bold text-lg text-green-300">{stats.ventasHoy}</span>
            </div>

            {stats.pendientes > 0 && (
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-yellow-300" />
                  <span className="text-sm">Pendientes</span>
                </div>
                <span className="font-bold text-lg text-yellow-300">{stats.pendientes}</span>
              </div>
            )}

            {stats.medicamentosVencidos > 0 && (
              <div className="flex items-center justify-between text-red-300 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span className="text-sm">Vencidos</span>
                </div>
                <span className="font-bold text-lg">{stats.medicamentosVencidos}</span>
              </div>
            )}

            {stats.stockBajo > 0 && (
              <div className="flex items-center justify-between text-orange-300">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span className="text-sm">Stock bajo</span>
                </div>
                <span className="font-bold text-lg">{stats.stockBajo}</span>
              </div>
            )}
          </motion.div>
        )}

        <nav className="flex-1 space-y-2 mb-6">
          {secciones.map((seccion) => (
            <motion.button
              key={seccion.id}
              whileHover={{ x: 4 }}
              onClick={() => setSeccionActual(seccion.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition font-semibold ${
                seccionActual === seccion.id
                  ? "bg-white/20 border-l-4 border-white"
                  : "hover:bg-white/10"
              }`}
            >
              {seccion.icono}
              <span>{seccion.nombre}</span>
            </motion.button>
          ))}
        </nav>

        <button
          onClick={cargarEstadisticas}
          disabled={actualizando}
          className="w-full px-3 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={16} className={actualizando ? "animate-spin" : ""} />
          {actualizando ? "Actualizando..." : "Actualizar"}
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {seccionActual === "dashboard" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Bienvenido al Dashboard</h1>
              <p className="text-gray-600">Aquí puedes ver el resumen de tu actividad</p>
            </div>

            {/* Grid de tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <CardEstadistica
                icon={<Package size={40} />}
                titulo="Total de Pedidos"
                valor={stats.totalPedidos}
                subtitulo="En el sistema"
                color="from-blue-500 to-blue-600"
              />
              <CardEstadistica
                icon={<FileText size={40} />}
                titulo="Ventas Hoy"
                valor={stats.ventasHoy}
                subtitulo="Facturas creadas"
                color="from-green-500 to-green-600"
              />
              <CardEstadistica
                icon={<TrendingUp size={40} />}
                titulo="Facturadas"
                valor={stats.facturados}
                subtitulo="Total procesadas"
                color="from-purple-500 to-purple-600"
              />
              <CardEstadistica
                icon={<Pill size={40} />}
                titulo="Medicamentos"
                valor={stats.medicamentosVencidos}
                subtitulo="Vencidos"
                isAlert={stats.medicamentosVencidos > 0}
              />
            </div>

            {/* Alertas de stock */}
            {(stats.medicamentosVencidos > 0 || stats.stockBajo > 0 || stats.pendientes > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500"
              >
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertCircle size={24} className="text-red-500" /> Alertas Importantes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.medicamentosVencidos > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-sm font-semibold text-red-800 mb-1">🔴 Medicamentos Vencidos</p>
                      <p className="text-2xl font-bold text-red-600">{stats.medicamentosVencidos}</p>
                      <p className="text-xs text-red-600 mt-2">Requieren atención inmediata</p>
                    </div>
                  )}
                  {stats.stockBajo > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm font-semibold text-yellow-800 mb-1">🟡 Stock Bajo</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.stockBajo}</p>
                      <p className="text-xs text-yellow-600 mt-2">Medicamentos con stock &lt;= 10</p>
                    </div>
                  )}
                  {stats.pendientes > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-800 mb-1">🔵 Pedidos Pendientes</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.pendientes}</p>
                      <p className="text-xs text-blue-600 mt-2">Pendientes de procesamiento</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {seccionActual === "medicamentos" && <MedicamentosEmpleado />}
        {seccionActual === "facturas" && <PanelFactura />}
        {seccionActual === "pedidos" && <PanelPedidos />}
      </main>
    </div>
  );
}