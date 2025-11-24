// src/pages/Usuarios.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import Modal from "../components/Modal";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [viewModal, setViewModal] = useState(false); // Nuevo modal para ver usuario
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // Usuario seleccionado para ver

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    nombre_completo: "",
    telefono: "",
    direccion: "",
    rol: "cliente",
  });

  const base = "/usuarios/usuarios/";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(base);
      setUsuarios(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      alert("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      username: "",
      email: "",
      password: "",
      nombre_completo: "",
      telefono: "",
      direccion: "",
      rol: "cliente",
    });
    setOpenModal(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      username: u.username || "",
      email: u.email || "",
      password: "",
      nombre_completo: u.nombre_completo || "",
      telefono: u.telefono || "",
      direccion: u.direccion || "",
      rol: u.rol || "cliente",
    });
    setOpenModal(true);
  };

  const openView = (u) => {
    setSelectedUser(u); // Guardar el usuario seleccionado
    setViewModal(true); // Abrir el modal para ver usuario
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar si el username ya existe
    const usernameExists = usuarios.some((u) => u.username === form.username);
    if (usernameExists && !editing) {
      alert("El nombre de usuario ya existe. Por favor, elige otro.");
      return;
    }

    try {
      if (editing) {
        await api.put(`${base}${editing.id}/`, form);
      } else {
        await api.post(base, form);
      }

      setOpenModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      alert("Error al guardar usuario. Verifica los datos e intenta nuevamente.");
    }
  };

  const handleDeactivate = async (u) => {
    if (!window.confirm("¿Inactivar usuario?")) return;

    try {
      await api.delete(`${base}${u.id}/`);
      fetchUsers();
    } catch (err) {
      console.error("Error al inactivar:", err);
      alert("Error al inactivar");
    }
  };

  // Filtrar usuarios según el texto de búsqueda
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <div className="flex gap-3">
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Nuevo usuario
          </button>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200"
          >
            {loading ? "Cargando..." : "Refrescar"}
          </button>
        </div>
      </header>

      {/* Campo de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por usuario o correo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div className="bg-white rounded-lg p-4 shadow">
        <table className="w-full">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="py-2">ID</th>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="py-2">{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.rol}</td>
                <td className="py-2 flex gap-2">
                  <button
                    onClick={() => openEdit(u)}
                    className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => openView(u)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded flex items-center gap-1"
                  >
                    👁️ Ver
                  </button>
                  <button
                    onClick={() => handleDeactivate(u)}
                    className="px-3 py-1 bg-red-500 text-white rounded flex items-center gap-1"
                  >
                    ❌ Inactivar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para ver usuario */}
      {viewModal && selectedUser && (
        <Modal
          open={viewModal}
          title={`Datos de ${selectedUser.username}`}
          onClose={() => setViewModal(false)}
          footer={null}
        >
          <div>
            <p>
              <strong>Nombre completo:</strong> {selectedUser.nombre_completo}
            </p>
            <p>
              <strong>Correo:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Teléfono:</strong> {selectedUser.telefono}
            </p>
            <p>
              <strong>Dirección:</strong> {selectedUser.direccion}
            </p>
            <p>
              <strong>Rol:</strong> {selectedUser.rol}
            </p>
          </div>
        </Modal>
      )}

      {/* Modal para crear/editar usuario */}
      <Modal
        open={openModal}
        title={editing ? "Editar Usuario" : "Crear Usuario"}
        onClose={() => setOpenModal(false)}
        footer={null}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Usuario"
            className="w-full px-3 py-2 border rounded"
            required
          />

          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Correo"
            type="email"
            className="w-full px-3 py-2 border rounded"
            required
          />

          <input
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Contraseña"
            type="password"
            className="w-full px-3 py-2 border rounded"
            {...(!editing ? { required: true } : {})}
          />

          <input
            value={form.nombre_completo}
            onChange={(e) =>
              setForm({ ...form, nombre_completo: e.target.value })
            }
            placeholder="Nombre completo"
            className="w-full px-3 py-2 border rounded"
          />

          <input
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            placeholder="Teléfono"
            className="w-full px-3 py-2 border rounded"
          />

          <input
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            placeholder="Dirección"
            className="w-full px-3 py-2 border rounded"
          />

          <select
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="cliente">Cliente</option>
            <option value="empleado">Empleado</option>
            <option value="admin">Administrador</option>
          </select>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setOpenModal(false)}
              type="button"
              className="px-4 py-2 rounded bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
