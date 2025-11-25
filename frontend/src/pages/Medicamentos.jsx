// src/pages/Medicamentos.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import Modal from "../components/Modal";

export default function Medicamentos() {
  const base = "/inventario/medicamentos-crud/";
  const categoriasBase = "/inventario/categorias/";
  const [medicamentos, setMedicamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [search, setSearch] = useState(""); // Estado para la búsqueda
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(null);
  const [open, setOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false); // Modal para ver detalles
  const [editing, setEditing] = useState(null);
  const [selectedMedicamento, setSelectedMedicamento] = useState(null); // Medicamento seleccionado para ver

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio_venta: 0,
    stock_actual: 0,
    stock_minimo: 0,
    fecha_vencimiento: "",
    estado: true,
    imagen_url: "",
    categoria_id: null,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [mRes, cRes] = await Promise.all([
        api.get(base, { params: { page, page_size: pageSize, search } }),
        api.get(categoriasBase),
      ]);
      const medData = mRes.data;
      if (medData && medData.results) {
        setMedicamentos(medData.results);
        setTotalCount(medData.count);
      } else {
        setMedicamentos(medData || []);
        setTotalCount(null);
      }
      setCategorias(cRes.data);
    } catch (err) {
      console.error(err);
      alert("Error cargando inventario");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      nombre: "",
      descripcion: "",
      precio_venta: 0,
      stock_actual: 0,
      stock_minimo: 0,
      fecha_vencimiento: "",
      estado: true,
      imagen_url: "",
      categoria_id: null,
    });
    setOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({
      nombre: m.nombre,
      descripcion: m.descripcion,
      precio_venta: m.precio_venta,
      stock_actual: m.stock_actual,
      stock_minimo: m.stock_minimo,
      fecha_vencimiento: m.fecha_vencimiento || "",
      estado: m.estado,
      imagen_url: m.imagen_url || "",
      categoria_id: m.categoria?.id || null,
    });
    setOpen(true);
  };

  const viewDetails = (m) => {
    setSelectedMedicamento(m);
    setViewModal(true);
  };

  const toggleActive = async (m) => {
    try {
      await api.patch(`${base}${m.id}/`, { estado: !m.estado });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error cambiando estado del medicamento");
    }
  };

  const save = async () => {
    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio_venta: form.precio_venta,
        stock_actual: form.stock_actual,
        stock_minimo: form.stock_minimo,
        fecha_vencimiento: form.fecha_vencimiento || null,
        estado: form.estado,
        imagen_url: form.imagen_url,
        categoria_id: form.categoria_id,
      };
      if (editing) {
        await api.put(`${base}${editing.id}/`, payload);
      } else {
        await api.post(base, payload);
      }
      setOpen(false);
      // reload current page
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error guardando medicamento");
    }
  };

  // when user types search, query backend (debounced)
  useEffect(() => {
    const t = setTimeout(() => fetchAll(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  const medicamentosFiltrados = medicamentos;

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Gestión de Medicamentos</h2>
        <div className="flex gap-3">
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            + Nuevo
          </button>
          <button
            onClick={fetchAll}
            className="px-4 py-2 bg-slate-100 rounded"
          >
            Refrescar
          </button>
        </div>
      </header>

      {/* Campo de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre de medicamento"
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
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {medicamentosFiltrados.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="py-2">{m.id}</td>
                <td>{m.nombre}</td>
                <td>${m.precio_venta}</td>
                <td>{m.stock_actual}</td>
                <td>{m.categoria?.nombre || "N/A"}</td>
                <td>
                  <button
                    onClick={() => toggleActive(m)}
                    className={`px-3 py-1 rounded ${
                      m.estado ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    {m.estado ? "🟢 Activo" : "🔴 Inactivo"}
                  </button>
                </td>
                <td className="flex gap-2 py-2">
                  <button
                    onClick={() => openEdit(m)}
                    className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => viewDetails(m)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded flex items-center gap-1"
                  >
                    👁️ Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination controls */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-slate-600">
            {totalCount ? (
              <>
                Mostrando {(page - 1) * pageSize + 1} -{" "}
                {Math.min(page * pageSize, totalCount)} de {totalCount} medicamentos
              </>
            ) : (
              `Página ${page}`
            )}
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
              onClick={() =>
                setPage(page + 1)
              }
              disabled={totalCount ? page * pageSize >= totalCount : false}
              className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>

      {/* Modal para ver detalles */}
      {viewModal && selectedMedicamento && (
        <Modal
          open={viewModal}
          title={`Detalles del medicamento: ${selectedMedicamento.nombre}`}
          onClose={() => setViewModal(false)}
          footer={null}
        >
          <div className="space-y-3">
            <p>
              <strong>Descripción:</strong> {selectedMedicamento.descripcion}
            </p>
            <p>
              <strong>Precio:</strong> ${selectedMedicamento.precio_venta}
            </p>
            <p>
              <strong>Stock actual:</strong> {selectedMedicamento.stock_actual}
            </p>
            <p>
              <strong>Stock mínimo:</strong> {selectedMedicamento.stock_minimo}
            </p>
            <p>
              <strong>Fecha de vencimiento:</strong>{" "}
              {selectedMedicamento.fecha_vencimiento || "N/A"}
            </p>
            <p>
              <strong>Categoría:</strong>{" "}
              {selectedMedicamento.categoria?.nombre || "N/A"}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              {selectedMedicamento.estado ? "Activo" : "Inactivo"}
            </p>
          </div>
        </Modal>
      )}

      {/* Modal para crear/editar medicamento */}
      <Modal
        open={open}
        title={editing ? "Editar medicamento" : "Nuevo medicamento"}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={save}
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Guardar
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Nombre"
            className="w-full px-3 py-2 border rounded"
          />
          <textarea
            value={form.descripcion}
            onChange={(e) =>
              setForm({ ...form, descripcion: e.target.value })
            }
            placeholder="Descripción"
            className="w-full px-3 py-2 border rounded"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.precio_venta}
              onChange={(e) =>
                setForm({ ...form, precio_venta: e.target.value })
              }
              placeholder="Precio"
              type="number"
              className="px-3 py-2 border rounded"
            />
            <input
              value={form.stock_actual}
              onChange={(e) =>
                setForm({ ...form, stock_actual: e.target.value })
              }
              placeholder="Stock actual"
              type="number"
              className="px-3 py-2 border rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.stock_minimo}
              onChange={(e) =>
                setForm({ ...form, stock_minimo: e.target.value })
              }
              placeholder="Stock mínimo"
              type="number"
              className="px-3 py-2 border rounded"
            />
            <input
              value={form.fecha_vencimiento}
              onChange={(e) =>
                setForm({ ...form, fecha_vencimiento: e.target.value })
              }
              placeholder="Fecha vencimiento (YYYY-MM-DD)"
              className="px-3 py-2 border rounded"
            />
          </div>

          <select
            value={form.categoria_id || ""}
            onChange={(e) =>
              setForm({ ...form, categoria_id: e.target.value || null })
            }
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">-- Seleccionar categoría --</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <input
            value={form.imagen_url}
            onChange={(e) =>
              setForm({ ...form, imagen_url: e.target.value })
            }
            placeholder="URL imagen (opcional)"
            className="w-full px-3 py-2 border rounded"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.estado}
              onChange={(e) =>
                setForm({ ...form, estado: e.target.checked })
              }
            />
            Activo
          </label>
        </div>
      </Modal>
    </div>
  );
}
