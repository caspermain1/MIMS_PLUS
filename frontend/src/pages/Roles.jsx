// src/pages/Roles.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import Modal from "../components/Modal";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState(""); // Estado para la búsqueda
  const [open, setOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false); // Modal para consultar rol
  const [editing, setEditing] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null); // Rol seleccionado para consulta

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
  });

  const baseRoles = "/usuarios/roles/"; // Ruta del ViewSet de roles

  useEffect(() => {
    fetchRoles();
  }, []);

  /** ----------------------------------------
   * 1. Obtener lista de roles
   -----------------------------------------*/
  const fetchRoles = async () => {
    try {
      const res = await api.get(baseRoles);
      setRoles(res.data);
    } catch (err) {
      console.error(err);
      alert("Error al cargar roles");
    }
  };

  /** ----------------------------------------
   * 2. Guardar (crear o editar)
   -----------------------------------------*/
  const save = async () => {
    try {
      if (editing) {
        await api.patch(`${baseRoles}${editing.id}/`, form);
      } else {
        await api.post(baseRoles, form);
      }

      setOpen(false);
      resetForm();
      fetchRoles();
    } catch (err) {
      console.error(err);
      alert("Error al guardar rol");
    }
  };

  /** ----------------------------------------
   * 3. Cambiar estado del rol (Activo/Inactivo)
   -----------------------------------------*/
  const toggleActive = async (r) => {
    try {
      await api.patch(`${baseRoles}${r.id}/`, { activo: !r.activo });
      fetchRoles();
    } catch (err) {
      console.error(err);
      alert("Error al cambiar estado del rol");
    }
  };

  /** ----------------------------------------
   * 4. Consultar rol
   -----------------------------------------*/
  const viewRole = (r) => {
    setSelectedRole(r);
    setViewModal(true);
  };

  /** ----------------------------------------
   * 5. Preparar modal para editar
   -----------------------------------------*/
  const startEdit = (r) => {
    setEditing(r);
    setForm({
      nombre: r.nombre,
      descripcion: r.descripcion,
      activo: r.activo,
    });
    setOpen(true);
  };

  /** ----------------------------------------
   * 6. Limpiar formulario
   -----------------------------------------*/
  const resetForm = () => {
    setEditing(null);
    setForm({ nombre: "", descripcion: "", activo: true });
  };

  /** ----------------------------------------
   * 7. Filtrar roles por nombre
   -----------------------------------------*/
  const rolesFiltrados = roles.filter((r) =>
    r.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Gestión de Roles</h2>

        <button
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          + Nuevo rol
        </button>
      </header>

      {/* Campo de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre de rol"
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
              <th>Descripción</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {rolesFiltrados.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2">{r.id}</td>
                <td>{r.nombre}</td>
                <td>{r.descripcion}</td>
                <td>
                  <button
                    onClick={() => toggleActive(r)}
                    className={`px-3 py-1 rounded ${
                      r.activo ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    {r.activo ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="flex gap-2 py-2">
                  <button
                    onClick={() => startEdit(r)}
                    className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => viewRole(r)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded flex items-center gap-1"
                  >
                    👁️ Consultar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para consultar rol */}
      {viewModal && selectedRole && (
        <Modal
          open={viewModal}
          title={`Detalles del rol: ${selectedRole.nombre}`}
          onClose={() => setViewModal(false)}
          footer={null}
        >
          <div className="space-y-3">
            <p>
              <strong>Nombre:</strong> {selectedRole.nombre}
            </p>
            <p>
              <strong>Descripción:</strong> {selectedRole.descripcion}
            </p>
          </div>
        </Modal>
      )}

      {/* Modal para crear/editar rol */}
      <Modal
        open={open}
        title={editing ? "Editar rol" : "Nuevo rol"}
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

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) =>
                setForm({ ...form, activo: e.target.checked })
              }
            />
            Activo
          </label>
        </div>
      </Modal>
    </div>
  );
}
