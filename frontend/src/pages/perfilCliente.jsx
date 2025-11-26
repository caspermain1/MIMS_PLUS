// src/pages/PerfilCliente.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Edit, ShoppingBag, Download } from "lucide-react";
import { exportarFacturaAPDF } from "../services/pdfServices.js";

export default function PerfilCliente() {
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [messageType, setMessageType] = useState(null); // 'success'|'error'
  const [facturas, setFacturas] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalFacturas, setTotalFacturas] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const perfilRes = await axios.get("http://localhost:8000/api/usuarios/perfil/", config);
        setUsuario(perfilRes.data);
        setFormData(perfilRes.data);

        const facturasRes = await axios.get(
          "http://localhost:8000/api/facturas/cliente/historial/",
          config
        );
        const allFacturas = Array.isArray(facturasRes.data) ? facturasRes.data : [];
        setTotalFacturas(allFacturas.length);
        
        // Aplicar paginación local
        const inicio = (page - 1) * pageSize;
        const fin = inicio + pageSize;
        setFacturas(allFacturas.slice(inicio, fin));
      } catch (error) {
        console.error("Error al cargar perfil:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, page]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const guardarCambios = async () => {
    // validación cliente
    const e = {};
    if (!formData.nombre_completo || formData.nombre_completo.trim().length < 3) e.nombre_completo = "Nombre mínimo 3 caracteres";
    if (formData.telefono && !/^\+?[0-9\s\-]{6,20}$/.test(formData.telefono)) e.telefono = "Teléfono inválido";
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) e.email = "Email inválido";
    if (Object.keys(e).length) { setErrors(e); setMensaje("Corrige los campos marcados"); setMessageType('error'); return; }

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.put(
        `http://localhost:8000/api/usuarios/editar-usuario/${usuario.id}/`,
        formData,
        config
      );

      setUsuario(res.data);
      setEditMode(false);
      setMensaje("Perfil actualizado correctamente ✅");
      setMessageType('success');
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      setMensaje("Error al actualizar perfil");
      setMessageType('error');
    }
  };

  // Modal para ver factura en detalle
  const [modalFactura, setModalFactura] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  const verFactura = (factura) => {
    setFacturaSeleccionada(factura);
    setModalFactura(true);
  };

  const imprimirFactura = (factura) => {
    // Crea una ventana nueva con contenido imprimible
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Factura ${factura.id}</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}h2{color:#0b72b9}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}</style></head><body><h2>Factura N° ${factura.id}</h2><p>Fecha: ${new Date(factura.fecha_emision).toLocaleString()}</p><p>Método: ${factura.metodo_pago}</p><p>Total: $${Number(factura.total).toLocaleString('es-CO')}</p><h3>Detalles</h3><table><thead><tr><th>Medicamento</th><th>Cantidad</th><th>Subtotal</th></tr></thead><tbody>${(factura.detalles||[]).map(d=>`<tr><td>${d.medicamento_nombre}</td><td>${d.cantidad}</td><td>$${Number(d.subtotal).toLocaleString('es-CO')}</td></tr>`).join('')}</tbody></table></body></html>`;
    const w = window.open('about:blank', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(()=> w.print(), 500);
    } else {
      alert('Permite la apertura de ventanas para imprimir la factura');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-blue-700 text-lg">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl w-full max-w-5xl p-6 sm:p-8">
        {/* Encabezado del perfil */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-6 mb-6 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
              <User className="text-white" size={40} />
            </div>
            <div>
              {editMode ? (
                <input
                  type="text"
                  name="nombre_completo"
                  value={formData.nombre_completo || ""}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded w-full text-xl font-bold text-blue-800"
                />
                  ) : (
                <h2 className="text-2xl font-bold text-blue-800">
                  {usuario?.nombre_completo || usuario?.username}
                </h2>
              )}
                {errors.nombre_completo && <p className="text-xs text-red-600 mt-1">{errors.nombre_completo}</p>}
              {editMode ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded w-full text-gray-500 mt-1"
                />
              ) : (
                <p className="text-gray-500">{usuario?.email}</p>
              )}
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>
          </div>

          <button
            className="bg-blue-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-600 flex items-center gap-2 transition self-start sm:self-auto"
            onClick={() => {
              if (editMode) guardarCambios();
              else setEditMode(true);
            }}
          >
            <Edit size={18} />
            {editMode ? "Guardar" : "Editar"}
          </button>
        </div>

        {/* Mensaje de acción */}
        {mensaje && (
          <div className={`mt-4 p-3 rounded-lg ${messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {mensaje}
          </div>
        )}

        {/* Información del usuario */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm text-gray-500">Usuario</label>
            <p className="text-gray-800 font-medium">{usuario?.username}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Rol</label>
            <p className="text-gray-800 font-medium">{usuario?.rol}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Teléfono</label>
            {editMode ? (
              <input
                type="text"
                name="telefono"
                value={formData.telefono || ""}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full"
              />
              ) : (
              <p className="text-gray-800 font-medium">{usuario?.telefono || "—"}</p>
            )}
              {errors.telefono && editMode && <p className="text-xs text-red-600 mt-1">{errors.telefono}</p>}
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm text-gray-500">Dirección</label>
            {editMode ? (
              <input
                type="text"
                name="direccion"
                value={formData.direccion || ""}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full"
              />
              ) : (
              <p className="text-gray-800 font-medium">{usuario?.direccion || "—"}</p>
            )}
              {errors.direccion && editMode && <p className="text-xs text-red-600 mt-1">{errors.direccion}</p>}
          </div>
        </div>

        {/* Historial de compras */}
        <div>
          <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
            <ShoppingBag size={22} /> Historial de Compras ({totalFacturas})
          </h3>

          {facturas.length === 0 ? (
            <p className="text-gray-600">No tienes facturas registradas.</p>
          ) : (
            <>
              <div className="space-y-4">
                {facturas.map((factura) => (
                  <div
                    key={factura.id}
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Factura N° {factura.id}</span>
                      <span>{new Date(factura.fecha_emision).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700">
                      <strong>Método de Pago:</strong> {factura.metodo_pago}
                    </p>
                    <p className="font-semibold text-green-700 mt-1">
                      Total: ${Number(factura.total).toLocaleString("es-CO")}
                    </p>

                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-2"
                        onClick={() => verFactura(factura)}
                      >
                        Ver
                      </button>
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-2"
                        onClick={() => imprimirFactura(factura)}
                      >
                        Imprimir
                      </button>
                      <button
                        className="px-3 py-1 bg-slate-100 text-slate-800 rounded hover:bg-slate-200 text-sm flex items-center gap-2"
                        onClick={() => exportarFacturaAPDF(factura, factura.detalles || [])}
                      >
                        <Download size={14} /> Descargar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalFacturas > pageSize && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-slate-600">
                    Mostrando {(page - 1) * pageSize + 1} -{" "}
                    {Math.min(page * pageSize, totalFacturas)} de {totalFacturas} facturas
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Anterior
                    </button>
                    <span className="px-3 py-1">Página {page}</span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(totalFacturas / pageSize)}
                      className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {/* Modal de factura */}
          {modalFactura && facturaSeleccionada && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={() => setModalFactura(false)} />
              <div className="relative bg-white rounded-xl shadow-xl w-11/12 max-w-2xl p-6 z-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Factura N° {facturaSeleccionada.id}</h3>
                  <button onClick={() => setModalFactura(false)} className="text-gray-600 hover:text-gray-800">Cerrar ✕</button>
                </div>

                <div className="text-sm text-gray-600 mb-3">Fecha: {new Date(facturaSeleccionada.fecha_emision).toLocaleString()}</div>
                <div className="text-sm mb-3">Método: {facturaSeleccionada.metodo_pago}</div>
                <div className="border rounded p-3 mb-3">
                  <ul className="space-y-2">
                    {(facturaSeleccionada.detalles || []).map((d) => (
                      <li key={d.id} className="flex justify-between">
                        <span>{d.medicamento_nombre} — {d.cantidad} unds</span>
                        <strong>${Number(d.subtotal).toLocaleString('es-CO')}</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center">
                  <strong>Total: ${Number(facturaSeleccionada.total).toLocaleString('es-CO')}</strong>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-2" onClick={() => exportarFacturaAPDF(facturaSeleccionada, facturaSeleccionada.detalles || [])}>
                      <Download size={14} /> Descargar
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => imprimirFactura(facturaSeleccionada)}>Imprimir</button>
                    <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setModalFactura(false)}>Cerrar</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}