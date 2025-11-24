// src/pages/Facturas.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import Modal from "../components/Modal";
import { exportarFacturaAPDF } from "../services/pdfServices.js";

export default function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // Lista de usuarios registrados
  const [medicamentos, setMedicamentos] = useState([]); // Lista de medicamentos registrados
  const [search, setSearch] = useState(""); // Estado para la búsqueda
  const [open, setOpen] = useState(false);
  const [editModal, setEditModal] = useState(false); // Modal para editar factura
  const [detalles, setDetalles] = useState([]);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    cliente: "",
    empleado: "",
    metodo_pago: "efectivo",
    correo_enviado: false,
    direccion_entrega: "",
    observaciones: "",
    fecha_emision: new Date().toISOString().slice(0, 10),
    detalles: [],
    total: 0,
  });

  const baseFacturas = "/facturas/facturas/";
  const baseUsuarios = "/usuarios/usuarios/";
  const baseMedicamentos = "/inventario/medicamentos-crud/";

  useEffect(() => {
    cargarFacturas();
    cargarUsuarios();
    cargarMedicamentos();
  }, []);

  const cargarFacturas = async () => {
    try {
      const res = await api.get(baseFacturas);
      setFacturas(res.data);
    } catch (err) {
      console.error("Error cargando facturas:", err);
      alert("Error cargando facturas");
    }
  };

  const cargarUsuarios = async () => {
    try {
      const res = await api.get(baseUsuarios);
      setUsuarios(res.data);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      alert("Error cargando usuarios");
    }
  };

  const cargarMedicamentos = async () => {
    try {
      const res = await api.get(baseMedicamentos);
      setMedicamentos(res.data);
    } catch (err) {
      console.error("Error cargando medicamentos:", err);
      alert("Error cargando medicamentos");
    }
  };

  const agregarMedicamento = (medicamento) => {
    const existe = form.detalles.find((d) => d.medicamento_id === medicamento.id);
    if (existe) {
      const nuevosDetalles = form.detalles.map((d) =>
        d.medicamento_id === medicamento.id
          ? {
              ...d,
              cantidad: d.cantidad + 1,
              subtotal: (d.cantidad + 1) * medicamento.precio_venta,
            }
          : d
      );
      setForm({
        ...form,
        detalles: nuevosDetalles,
        total: nuevosDetalles.reduce((acc, d) => acc + d.subtotal, 0),
      });
    } else {
      const nuevoDetalle = {
        medicamento_id: medicamento.id,
        medicamento_nombre: medicamento.nombre,
        cantidad: 1,
        precio_unitario: medicamento.precio_venta,
        subtotal: medicamento.precio_venta,
      };
      const nuevosDetalles = [...form.detalles, nuevoDetalle];
      setForm({
        ...form,
        detalles: nuevosDetalles,
        total: nuevosDetalles.reduce((acc, d) => acc + d.subtotal, 0),
      });
    }
  };

  const eliminarMedicamento = (index) => {
    const nuevosDetalles = form.detalles.filter((_, i) => i !== index);
    setForm({
      ...form,
      detalles: nuevosDetalles,
      total: nuevosDetalles.reduce((acc, d) => acc + d.subtotal, 0),
    });
  };

  const saveFactura = async () => {
    try {
      // Validar que el cliente esté seleccionado
      if (!form.cliente) {
        alert("Por favor, selecciona un cliente.");
        return;
      }

      // Validar que haya al menos un detalle
      if (form.detalles.length === 0) {
        alert("Por favor, agrega al menos un medicamento.");
        return;
      }

      // Crear el payload con la estructura correcta
      const payload = {
        cliente: form.cliente,
        empleado: form.empleado || null,
        metodo_pago: form.metodo_pago,
        correo_enviado: form.correo_enviado,
        direccion_entrega: form.direccion_entrega,
        observaciones: form.observaciones,
        fecha_emision: form.fecha_emision,
        detalles: form.detalles.map((d) => ({
          medicamento: d.medicamento_id,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          subtotal: d.subtotal,
        })),
        total: form.total,
      };

      console.log("Payload enviado:", payload); // <-- Inspecciona los datos enviados

      // Enviar la solicitud al backend
      if (selected) {
        await api.put(`${baseFacturas}${selected.id}/`, payload);
      } else {
        await api.post(baseFacturas, payload);
      }

      // Cerrar el modal y recargar las facturas
      setEditModal(false);
      cargarFacturas();
    } catch (err) {
      console.error("Error guardando factura:", err);
      alert("Error guardando factura. Verifica los datos e intenta nuevamente.");
    }
  };

  const descargarPDF = (factura) => {
    exportarFacturaAPDF(factura, factura.detalles || []);
  };

  const facturasFiltradas = facturas.filter((f) =>
    f.cliente.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Gestión de Facturas</h2>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setForm({
                cliente: "",
                empleado: "",
                metodo_pago: "efectivo",
                correo_enviado: false,
                direccion_entrega: "",
                observaciones: "",
                fecha_emision: new Date().toISOString().slice(0, 10),
                detalles: [],
                total: 0,
              });
              setEditModal(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Nueva Factura
          </button>

          <button
            onClick={cargarFacturas}
            className="px-4 py-2 bg-slate-100 rounded hover:bg-slate-200"
          >
            Refrescar
          </button>
        </div>
      </header>

      {/* Campo de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por cliente"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg p-4 shadow">
        <table className="w-full">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="py-2">ID</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {facturasFiltradas.map((f) => (
              <tr key={f.id} className="border-t hover:bg-slate-50 cursor-pointer">
                <td className="py-2">{f.id}</td>
                <td>{f.cliente_nombre || f.cliente}</td>
                <td>{new Date(f.fecha_emision).toLocaleDateString()}</td>
                <td className="font-semibold">${f.total}</td>
                <td className="flex gap-2">
                  <button
                    onClick={() => setOpen(true)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                  >
                    👁️ Ver
                  </button>
                  <button
                    onClick={() => setEditModal(true)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center gap-1"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => descargarPDF(f)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                  >
                    📄 PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
