// src/pages/PanelAdmin.jsx
import React, { useState, useEffect } from "react";
import {
  Users,
  Package,
  FileText,
  Settings,
  BarChart2,
  Mail,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import API from "../services/api";

import Usuarios from "./Usuarios";
import Roles from "./Roles";
import Medicamentos from "./Medicamentos";
import Reportes from "./Reportes";
import Mensajes from "./Mensajes";

export default function PanelAdmin() {
  const [seccion, setSeccion] = useState("dashboard");
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalMedicamentos: 0,
    totalFacturas: 0,
    totalPedidos: 0,
    medicamentosVencidos: 0,
    stockBajo: 0,
    facturasNoPayadas: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const [usuarios, medicamentos, facturas, pedidos] = await Promise.all([
        API.get("/usuarios/usuarios/").catch(() => ({ data: [] })),
        API.get("/inventario/medicamentos/").catch(() => ({ data: [] })),
        API.get("/facturas/facturas/").catch(() => ({ data: [] })),
        API.get("/pedidos/pedidos/").catch(() => ({ data: [] })),
      ]);

      const medicamentosData = medicamentos.data || [];
      const facturasData = facturas.data || [];

      const vencidos = medicamentosData.filter((m) => {
        if (!m.fecha_vencimiento) return false;
        return new Date(m.fecha_vencimiento) < new Date();
      }).length;

      const bajo = medicamentosData.filter((m) => m.stock_actual <= 10).length;
      const noPagadas = facturasData.filter((f) => f.estado !== "pagada").length;

      setStats({
        totalUsuarios: usuarios.data?.length || 0,
        totalMedicamentos: medicamentosData.length,
        totalFacturas: facturasData.length,
        totalPedidos: pedidos.data?.length || 0,
        medicamentosVencidos: vencidos,
        stockBajo: bajo,
        facturasNoPayadas: noPagadas,
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderMain = () => {
    switch (seccion) {
      case "dashboard":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Dashboard Administrativo
              </h2>
              <p className="text-slate-600">Resumen de la actividad del sistema</p>
            </div>

            {/* Grid de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card: Total Usuarios */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Usuarios</p>
                    <p className="text-3xl font-bold">{stats.totalUsuarios}</p>
                  </div>
                  <Users size={40} className="opacity-30" />
                </div>
              </motion.div>

              {/* Card: Total Medicamentos */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Medicamentos</p>
                    <p className="text-3xl font-bold">{stats.totalMedicamentos}</p>
                  </div>
                  <Package size={40} className="opacity-30" />
                </div>
              </motion.div>

              {/* Card: Total Facturas */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Facturas</p>
                    <p className="text-3xl font-bold">{stats.totalFacturas}</p>
                  </div>
                  <FileText size={40} className="opacity-30" />
                </div>
              </motion.div>

              {/* Card: Total Pedidos */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Pedidos</p>
                    <p className="text-3xl font-bold">{stats.totalPedidos}</p>
                  </div>
                  <TrendingUp size={40} className="opacity-30" />
                </div>
              </motion.div>
            </div>

            {/* Alertas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Alerta: Medicamentos Vencidos */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-red-50 border-l-4 border-red-500 p-4 rounded"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={24} className="text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Medicamentos Vencidos</p>
                    <p className="text-2xl font-bold text-red-600">{stats.medicamentosVencidos}</p>
                    <p className="text-sm text-red-700 mt-1">Requieren atención inmediata</p>
                  </div>
                </div>
              </motion.div>

              {/* Alerta: Stock Bajo */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={24} className="text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-800">Stock Bajo</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.stockBajo}</p>
                    <p className="text-sm text-yellow-700 mt-1">&lt;= 10 unidades</p>
                  </div>
                </div>
              </motion.div>

              {/* Alerta: Facturas Sin Pagar */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={24} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800">Facturas Pendientes</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.facturasNoPayadas}</p>
                    <p className="text-sm text-blue-700 mt-1">Sin pagar o canceladas</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <button
              onClick={cargarEstadisticas}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Actualizar estadísticas
            </button>
          </motion.div>
        );
      case "usuarios":
        return <Usuarios />;
      case "roles":
        return <Roles />;
      case "inventario":
        return <Medicamentos />;
      case "reportes":
        return <Reportes />;
      case "mensajes":
        return <Mensajes />;
      default:
        return <Usuarios />;
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-sky-700 to-blue-700 text-white p-6 flex flex-col min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Droguería MIMS</h1>
          <p className="text-sm text-sky-100 mt-1">Panel administrativo</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setSeccion("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 ${
              seccion === "dashboard" ? "bg-white/10" : ""
            }`}
          >
            <BarChart2 size={18} /> Dashboard
          </button>

          <button
            onClick={() => setSeccion("usuarios")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 ${
              seccion === "usuarios" ? "bg-white/10" : ""
            }`}
          >
            <Users size={18} /> Usuarios
          </button>

          <button
            onClick={() => setSeccion("roles")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 ${
              seccion === "roles" ? "bg-white/10" : ""
            }`}
          >
            <Settings size={18} /> Roles
          </button>

          <button
            onClick={() => setSeccion("inventario")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 ${
              seccion === "inventario" ? "bg-white/10" : ""
            }`}
          >
            <Package size={18} /> Inventario
          </button>

          <button
            onClick={() => setSeccion("reportes")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 ${
              seccion === "reportes" ? "bg-white/10" : ""
            }`}
          >
            <BarChart2 size={18} /> Reportes
          </button>

          <button
            onClick={() => setSeccion("mensajes")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 ${
              seccion === "mensajes" ? "bg-white/10" : ""
            }`}
          >
            <Mail size={18} /> Mensajes
          </button>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8">{renderMain()}</main>
    </div>
  );
}