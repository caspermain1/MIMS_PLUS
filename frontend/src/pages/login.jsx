import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario } from "../services/api.js"; // ✅ IMPORTANTE: .js
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import "../styles/Login.css";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUsuario(formData); // ✅ usa tu función centralizada

      // Redirección según rol (usa los valores exactos de tu backend)
      if (data.usuario.rol === "admin") {
        navigate("/panelAdmin");       // ✅ coincide con App.jsx
      } else if (data.usuario.rol === "empleado") {
        navigate("/panelEmpleado");    // ✅
      } else {
        navigate("/perfilCliente");    // ✅
      }
    } catch (err) {
      console.error("Error login:", err);
      if (err.message.includes("Credenciales inválidas")) {
        setError("Usuario o contraseña incorrectos");
      } else {
        setError("Error al conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-bg min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 💫 Fondo animado */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="burbuja"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{ y: [0, -50, 0], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: Math.random() * 6 + 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 🧾 Contenedor del formulario */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="login-form relative z-10"
      >
        <div className="text-center mb-6">
          <LogIn className="text-green-600 mb-2 mx-auto" size={46} />
          <h2 className="text-3xl font-bold text-blue-800 tracking-tight">
            Iniciar Sesión
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Accede a tu cuenta para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={formData.username}
            onChange={handleChange}
            required
            className="login-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
            className="login-input"
          />

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        {error && <p className="text-red-600 text-center mt-4">{error}</p>}

        <div className="text-center mt-6">
          <p
            className="text-sm text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate("/recuperar")}
          >
            ¿Olvidaste tu contraseña?
          </p>
          <p className="text-sm text-gray-600 mt-2">
            ¿No tienes cuenta?{" "}
            <span
              className="text-green-600 font-semibold cursor-pointer hover:underline"
              onClick={() => navigate("/registro")}
            >
              Regístrate aquí
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
