// src/pages/EmpleadoDashboard.jsx
import React, { useState } from "react";
import { Pill, FileText, Package } from "lucide-react";
import MedicamentosEmpleado from "./medicamentosEmpleado";
import PanelFactura from "./panelFactura";
import PanelPedidos from "./PanelPedidos";
import "../styles/empleadoDashboard.css";

export default function EmpleadoDashboard() {
  const [seccionActual, setSeccionActual] = useState("medicamentos");

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