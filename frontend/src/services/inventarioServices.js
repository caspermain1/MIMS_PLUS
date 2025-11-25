// src/services/inventarioService.js
import API from "./api.js";


/* ===============================
// 🧩 CATEGORÍAS CON MEDICAMENTOS ANIDADOS (público)
================================= */
export const getCategoriasConMedicamentos = async () => {
  const res = await API.get("/inventario/catalogo/categorias-con-medicamentos/");
  return res.data;
};

export const getCatalogo = async (params = {}) => {
  const res = await API.get("/inventario/catalogo/", { params });
  return res.data;
};

export const getProveedores = async (q = "", page = 1, page_size = 10) => {
  const res = await API.get("/inventario/catalogo/proveedores/", { params: { q, page, page_size } });
  return res.data;
};

export const getDrogueriasPublic = async () => {
  const res = await API.get("/inventario/catalogo/droguerias/");
  return res.data;
};


/* ===============================
   💊 MEDICAMENTOS (CRUD protegido)
================================= */
export const getMedicamentos = async () => {
  const res = await API.get("/inventario/medicamentos/");
  return res.data;
};

export const crearMedicamento = async (data) => {
  const res = await API.post("/inventario/medicamentos/", data);
  return res.data;
};

export const actualizarMedicamento = async (id, data) => {
  const res = await API.put(`/inventario/medicamentos/${id}/`, data);
  return res.data;
};

export const eliminarMedicamento = async (id) => {
  const res = await API.delete(`/inventario/medicamentos/${id}/`);
  return res.data;
};

