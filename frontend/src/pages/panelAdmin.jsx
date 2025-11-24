// src/pages/PanelAdmin.jsx
import React, { useState } from "react";
import {
  Users,
  Package,
  FileText,
  Settings,
  BarChart2,
  Mail,
} from "lucide-react";

import Usuarios from "./Usuarios";
import Roles from "./Roles";
import Medicamentos from "./Medicamentos";
import Reportes from "./Reportes";
import Mensajes from "./Mensajes";

export default function PanelAdmin() {
  const [seccion, setSeccion] = useState("usuarios");

  const renderMain = () => {
    switch (seccion) {
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
    <div className="flex bg-slate-50">
      {/* Sidebar ajustado: sin fixed, sin height 100vh */}
      <aside className="w-72 bg-gradient-to-b from-sky-700 to-blue-700 text-white p-6 flex flex-col min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Droguería MIMS</h1>
          <p className="text-sm text-sky-100 mt-1">Panel administrativo</p>
        </div>

        <nav className="flex-1 space-y-2">
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
        {/* ❌ Sin botón de cerrar sesión aquí */}
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8">{renderMain()}</main>
    </div>
  );
}