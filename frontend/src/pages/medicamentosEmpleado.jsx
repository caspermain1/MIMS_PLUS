import React, { useState, useEffect } from "react";
import { getMedicamentos, crearMedicamento, actualizarMedicamento, eliminarMedicamento } from "../services/inventarioServices";
import "../styles/empleadoDashboard.css";

const MedicamentosEmpleado = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    precio_venta: "",
    stock_actual: "",
  });
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    cargarMedicamentos();
  }, []);

  const cargarMedicamentos = async () => {
    setLoading(true);
    try {
      const data = await getMedicamentos();
      setMedicamentos(data);
    } catch {
      console.error("Error al cargar medicamentos");
    }
    setLoading(false);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await actualizarMedicamento(editando, formData);
        setMensaje("Medicamento actualizado correctamente.");
      } else {
        await crearMedicamento(formData);
        setMensaje("Medicamento creado correctamente.");
      }
      setFormData({ nombre: "", precio_venta: "", stock_actual: "" });
      setEditando(null);
      setMostrarFormulario(false);
      cargarMedicamentos();
    } catch {
      setMensaje("Error al guardar el medicamento.");
    }
  };

  const handleEditar = (med) => {
    setFormData({
      nombre: med.nombre,
      precio_venta: med.precio_venta,
      stock_actual: med.stock_actual,
    });
    setEditando(med.id);
    setMensaje("");
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Deseas inactivar este medicamento?")) {
      try {
        await eliminarMedicamento(id);
        setMensaje("Medicamento inactivado correctamente.");
        cargarMedicamentos();
      } catch (error) {
        console.error("Error al inactivar medicamento:", error);
        setMensaje("Ocurrió un error al inactivar el medicamento.");
      }
    }
  };

  const handleVer = (med) => {
    alert(`Detalles del medicamento:\n\nNombre: ${med.nombre}\nPrecio: ${med.precio_venta}\nStock: ${med.stock_actual}`);
  };

  const medicamentosFiltrados = medicamentos.filter((med) =>
    med.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="panel-empleado">
      <h2 className="titulo">Gestión de Medicamentos</h2>

      <div className="acciones-superiores">
        <button
          className="btn-nuevo"
          onClick={() => {
            setFormData({ nombre: "", precio_venta: "", stock_actual: "" });
            setEditando(null);
            setMostrarFormulario(true);
          }}
        >
          + Nuevo Medicamento
        </button>

        <input
          type="text"
          placeholder="🔍 Buscar medicamento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="campo-busqueda"
        />
      </div>

      <table className="tabla-medicamentos">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicamentosFiltrados.map((m) => (
            <tr key={m.id}>
              <td>{m.nombre}</td>
              <td>${m.precio_venta}</td>
              <td>{m.stock_actual}</td>
              <td className="acciones-horizontal">
                <button className="btn-accion btn-editar" onClick={() => handleEditar(m)}>
                  ✏️ Editar
                </button>
                <button className="btn-accion btn-ver" onClick={() => handleVer(m)}>
                  👁️ Ver
                </button>
                <button className="btn-accion btn-eliminar" onClick={() => handleEliminar(m.id)}>
                  ❌ Inactivar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarFormulario && (
        <div className="modal">
          <div className="modal-contenido">
            <h3>{editando ? "Editar Medicamento" : "Nuevo Medicamento"}</h3>
            <form onSubmit={handleSubmit}>
              <input
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="precio_venta"
                placeholder="Precio"
                value={formData.precio_venta}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="stock_actual"
                placeholder="Stock"
                value={formData.stock_actual}
                onChange={handleChange}
                required
              />
              <div className="modal-acciones">
                <button type="submit" className="btn-guardar">
                  {editando ? "Actualizar" : "Registrar"}
                </button>
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setMostrarFormulario(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
};

export default MedicamentosEmpleado;
