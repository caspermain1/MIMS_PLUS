import React, { useState, useEffect } from "react";
import API from "../services/api";
import "../styles/empleadoDashboard.css";

export default function PanelFactura() {
  const [clientes, setClientes] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");

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

  const cargarClientes = async () => {
    try {
      const res = await API.get("/usuarios/usuarios/");
      setClientes(res.data);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
    }
  };

  const cargarFacturas = async () => {
    try {
      const res = await API.get("/facturas/facturas/");
      setFacturas(res.data);
    } catch (err) {
      console.error("Error al cargar facturas:", err);
    }
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
    setMensaje("Inicia el proceso de creación de una nueva factura.");
  };

  const handleVerFactura = (factura) => {
    alert(`Detalles de la factura:\n\nCliente: ${factura.cliente_nombre}\nTotal: ${factura.total}`);
  };

  const handleEditarFactura = (facturaSel) => {
    setFactura({
      id: facturaSel.id,
      cliente: facturaSel.cliente,
      metodo_pago: facturaSel.metodo_pago,
      direccion_entrega: facturaSel.direccion_entrega,
      observaciones: facturaSel.observaciones,
      total: parseFloat(facturaSel.total),
      detalles: facturaSel.detalles.map((d) => ({
        medicamento_id: null,
        medicamento_nombre: d.medicamento,
        precio_unitario: parseFloat(d.precio_unitario),
        cantidad: d.cantidad,
        subtotal: parseFloat(d.subtotal),
      })),
    });
    setMensaje("Edita la factura seleccionada.");
  };

  const handleDescargarFactura = (factura) => {
    alert(`Descargando factura #${factura.id}`);
    // Aquí puedes implementar la lógica para descargar la factura en formato PDF
  };

  const facturasFiltradas = facturas.filter(
    (f) =>
      f.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      f.id.toString().includes(busqueda)
  );

  return (
    <div className="panel-factura">
      <h2 className="titulo">Gestión de Facturas</h2>

      {mensaje && <div className="mensaje">{mensaje}</div>}

      <div className="acciones-superiores">
        <button className="btn-nuevo" onClick={handleCrearFactura}>
          + Crear Factura
        </button>

        <input
          type="text"
          placeholder="🔍 Buscar factura por cliente o número..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="campo-busqueda"
        />
      </div>

      <table className="tabla-medicamentos">
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Método</th>
            <th>Total</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {facturasFiltradas.map((f) => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.cliente_nombre}</td>
              <td>{f.metodo_pago}</td>
              <td>${f.total}</td>
              <td>{new Date(f.fecha_emision).toLocaleString("es-CO")}</td>
              <td className="acciones-horizontal">
                <button className="btn-accion btn-ver" onClick={() => handleVerFactura(f)}>
                  👁️ Ver
                </button>
                <button className="btn-accion btn-editar" onClick={() => handleEditarFactura(f)}>
                  ✏️ Editar
                </button>
                <button className="btn-accion btn-descargar" onClick={() => handleDescargarFactura(f)}>
                  📥 Descargar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
