// src/services/pedidosServices.js
import API from "./api.js";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const obtenerPedidos = async () => {
  const res = await API.get("pedidos/listar/", getAuthHeaders());
  return res.data;
};

export const crearPedido = async (pedidoData) => {
  const res = await API.post("pedidos/crud/", pedidoData, getAuthHeaders());
  return res.data;
};

export const actualizarPedido = async (id, pedidoData) => {
  const res = await API.put(`pedidos/crud/${id}/`, pedidoData, getAuthHeaders());
  return res.data;
};

export const cambiarEstadoPedido = async (id, nuevoEstado) => {
  const res = await API.put(
    `pedidos/actualizar/${id}/`,
    { estado: nuevoEstado },
    getAuthHeaders()
  );
  return res.data;
};