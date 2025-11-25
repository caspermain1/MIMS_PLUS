// src/pages/PerfilCliente.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Edit, ShoppingBag } from "lucide-react";

export default function PerfilCliente() {
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
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
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      alert("Error al actualizar perfil");
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
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition"
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

                    {factura.detalles?.length > 0 && (
                      <ul className="list-disc ml-5 mt-2 text-gray-700">
                        {factura.detalles.map((d) => (
                          <li key={d.id}>
                            {d.medicamento_nombre} — {d.cantidad} unds — $
                            {Number(d.subtotal).toLocaleString("es-CO")}
                          </li>
                        ))}
                      </ul>
                    )}
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
        </div>
      </div>
    </div>
  );
}