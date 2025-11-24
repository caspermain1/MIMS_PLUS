import api from "./api.js";

const BASE = "/facturas/facturas/";
const DETALLES_BASE = "/facturas/detalles/";

// ✅ Obtener todas las facturas
export const getFacturas = () => api.get(BASE);

// ✅ Crear una factura
export const crearFactura = (data) => api.post(BASE, data);

// ✅ Actualizar una factura
export const actualizarFactura = (id, data) => api.put(`${BASE}${id}/`, data);

// ✅ Eliminar una factura
export const eliminarFactura = (id) => api.delete(`${BASE}${id}/`);

// ✅ Obtener detalles
export const getDetalles = () => api.get(DETALLES_BASE);
