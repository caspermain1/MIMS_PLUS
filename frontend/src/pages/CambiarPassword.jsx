import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CambiarPassword() {
  const [formData, setFormData] = useState({
    email: "",
    codigo: "",
    nueva_contrasena: "",
    confirmar_contrasena: "",
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const evaluarFortaleza = (value) => {
    let puntos = 0;

    if (value.length >= 8) puntos += 25;
    if (/[A-Z]/.test(value)) puntos += 25;
    if (/[0-9]/.test(value)) puntos += 25;
    if (/[@$!%*?&#]/.test(value)) puntos += 25;

    setPasswordStrength(puntos);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setMensaje("");

    if (e.target.name === "nueva_contrasena") {
      evaluarFortaleza(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.nueva_contrasena !== formData.confirmar_contrasena) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/usuarios/cambiar-contrasena/",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      setMensaje(res.data.mensaje || "Contraseña actualizada correctamente.");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "No se pudo cambiar la contraseña. Verifica los datos."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-blue-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-xl border-t-4 border-blue-500">

        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">
          Cambiar contraseña
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Correo registrado"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md bg-blue-50/50 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <input
            type="text"
            name="codigo"
            placeholder="Código enviado al correo"
            value={formData.codigo}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md bg-blue-50/50 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <input
            type="password"
            name="nueva_contrasena"
            placeholder="Nueva contraseña"
            value={formData.nueva_contrasena}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md bg-blue-50/50 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          {/* Barra de seguridad */}
          <div className="w-full bg-gray-200 h-2 rounded">
            <div
              className="h-full rounded"
              style={{
                width: `${passwordStrength}%`,
                backgroundColor:
                  passwordStrength < 50
                    ? "red"
                    : passwordStrength < 75
                    ? "orange"
                    : "green",
              }}
            ></div>
          </div>

          <input
            type="password"
            name="confirmar_contrasena"
            placeholder="Confirmar contraseña"
            value={formData.confirmar_contrasena}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md bg-blue-50/50 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white text-md font-semibold ${
              loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>

        {mensaje && (
          <p className="text-green-600 mt-4 text-center">{mensaje}</p>
        )}
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        <p
          onClick={() => navigate("/login")}
          className="text-center text-sm text-blue-600 mt-4 cursor-pointer hover:underline"
        >
          Volver al login
        </p>
      </div>
    </div>
  );
}
