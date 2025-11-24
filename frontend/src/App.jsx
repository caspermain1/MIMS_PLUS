// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/home.jsx";
import CatalogoMedicamentos from "./pages/catalogo.jsx";
import Registro from "./pages/registro.jsx";
import Login from "./pages/login.jsx";
import PerfilCliente from "./pages/perfilCliente.jsx";
import PanelAdmin from "./pages/panelAdmin.jsx";
import EmpleadoDashboard from "./pages/empleadoDashboard.jsx";
import EnviarCorreoRecuperacion from "./pages/EnviarCorreoRecuperacion.jsx";
import CambiarPassword from "./pages/CambiarPassword.jsx";
import Acerca from "./pages/Acerca.jsx";
import Reseñas from "./pages/reseñas.jsx";
import Mensajes from "./pages/Mensajes.jsx";
import Contacto from "./pages/Contacto.jsx";

// 🔐 Ruta protegida por rol
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("usuario") || "{}");

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.rol))
    return <Navigate to="/home" replace />;

  return children;
};

export default function App() {
  const [carrito, setCarrito] = useState([]);
  const [carritoOpen, setCarritoOpen] = useState(false);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout
            carrito={carrito}
            carritoOpen={carritoOpen}
            setCarritoOpen={setCarritoOpen}
          />
        }
      >
        <Route index element={<Navigate to="/home" replace />} />

        {/* 🌐 Rutas públicas */}
        <Route
          path="home"
          element={<Home carrito={carrito} setCarrito={setCarrito} carritoOpen={carritoOpen} setCarritoOpen={setCarritoOpen} />}
        />
        <Route
          path="catalogo"
          element={<CatalogoMedicamentos carrito={carrito} setCarrito={setCarrito} />}
        />
        <Route path="registro" element={<Registro />} />
        <Route path="login" element={<Login />} />
        <Route path="acerca" element={<Acerca />} />
        <Route path="reseñas" element={<Reseñas />} />
        <Route path="recuperar" element={<EnviarCorreoRecuperacion />} />
        <Route path="cambiar-contrasena" element={<CambiarPassword />} />
        <Route path="contacto" element={<Contacto />} />

        {/* 🔒 Rutas privadas */}
        <Route
          path="perfilcliente"
          element={
            <PrivateRoute allowedRoles={["cliente"]}>
              <PerfilCliente />
            </PrivateRoute>
          }
        />
        <Route
          path="paneladmin"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <PanelAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="panelempleado"
          element={
            <PrivateRoute allowedRoles={["empleado"]}>
              <EmpleadoDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="mensajes"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Mensajes />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}