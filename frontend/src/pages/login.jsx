import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario } from "../services/api.js"; // ✅ IMPORTANTE: .js
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff } from "lucide-react";
import "../styles/Login.css";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState(null);
  const [messageType, setMessageType] = useState(null); // 'success'|'error'
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setErrors({ ...errors, [e.target.name]: null });
  };

  const validarForm = () => {
    const errs = {};
    if (!formData.username || !formData.username.trim()) errs.username = "Ingresa tu usuario";
    if (!formData.password || formData.password.length < 8) errs.password = "La contraseña debe tener al menos 8 caracteres";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const passwordStrength = (pwd) => {
    if (!pwd) return "vacía";
    if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return "fuerte";
    if (pwd.length >= 8) return "media";
    return "débil";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (blockedUntil && Date.now() < blockedUntil) {
      setError("Demasiados intentos. Intenta de nuevo más tarde.");
      setMessageType('error');
      return;
    }

    if (!validarForm()) {
      setMessageType('error');
      return;
    }
    
    setLoading(true);
    try {
      const data = await loginUsuario(formData); // ✅ usa tu función centralizada

      // Redirección según rol (usa los valores exactos de tu backend)
      setMessageType('success');
      setAttempts(0);
      if (rememberMe) {
        localStorage.setItem('remember', '1');
      } else {
        localStorage.removeItem('remember');
      }
      if (data.usuario.rol === "admin") {
        navigate("/panelAdmin");       // ✅ coincide con App.jsx
      } else if (data.usuario.rol === "empleado") {
        navigate("/panelEmpleado");    // ✅
      } else {
        navigate("/perfilCliente");    // ✅
      }
    } catch (err) {
      console.error("Error login:", err);
      // incrementar intentos y bloquear temporalmente si supera 3
      setAttempts((a) => {
        const newCount = a + 1;
        if (newCount >= 3) setBlockedUntil(Date.now() + 30 * 1000); // bloquear 30s
        return newCount;
      });
      if (err.message.includes("Credenciales inválidas")) {
        setError("Usuario o contraseña incorrectos");
      } else if (err.message.includes("Usuario no encontrado")) {
        setError("Este usuario no existe");
      } else {
        setError("Error al conectar con el servidor. Intenta más tarde.");
      }
      setMessageType('error');
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
          <div className="relative">
            <input
              type="text"
              name="username"
              placeholder="Usuario"
              value={formData.username}
              onChange={handleChange}
              aria-label="Usuario"
              aria-invalid={errors.username ? "true" : "false"}
              className={`login-input ${errors.username ? 'ring-2 ring-red-200' : ''}`}
            />
            {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
          </div>

          <div className="relative">
            <input
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              aria-label="Contraseña"
              aria-invalid={errors.password ? "true" : "false"}
              className={`login-input pr-12 ${errors.password ? 'ring-2 ring-red-200' : ''}`}
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((v) => !v)}
              aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <div>Fortaleza: <strong className="ml-1 text-gray-700">{passwordStrength(formData.password)}</strong></div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span className="text-xs">Recordarme</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
            aria-busy={loading}
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
