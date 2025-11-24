// src/components/Layout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function Layout({ carrito = [], carritoOpen, setCarritoOpen }) {
  const location = useLocation();

  // Solo ocultar en login y registro
  const ocultarMenuEn = ["/login", "/registro"];
  const ocultarMenu = ocultarMenuEn.includes(location.pathname);

  return (
    <>
      {!ocultarMenu && (
        <Navbar
          carrito={carrito}
          carritoOpen={carritoOpen}
          setCarritoOpen={setCarritoOpen}
        />
      )}
      <Outlet />
    </>
  );
}