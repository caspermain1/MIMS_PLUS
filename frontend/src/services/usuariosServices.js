import API from "./api.js";

export const obtenerUsuarios = async () => {
  const res = await API.get("usuarios/");
  return res.data;
};
