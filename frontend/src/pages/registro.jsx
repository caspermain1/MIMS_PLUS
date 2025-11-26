import React, { useState } from "react";
import { registerUsuario, loginUsuario } from "../services/api.js";
import { motion } from "framer-motion";
import { Pill, UserPlus, LogIn, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/registro.css"; // 👈 Importa los estilos

export default function Registro() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    nombre_completo: "",
    telefono: "",
    direccion: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [messageType, setMessageType] = useState(null); // 'success'|'error'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
    setMensaje("");
    setMessageType(null);
  };

  const handleConfirm = (e) => {
    setConfirmPassword(e.target.value);
    setErrors({ ...errors, confirmar: null });
  };

  const validar = () => {
    const e = {};
    if (!formData.username || formData.username.trim().length < 3) e.username = "Usuario mínimo 3 caracteres";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) e.email = "Correo inválido";
    if (!formData.password || formData.password.length < 8) e.password = "Contraseña mínimo 8 caracteres";
    if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) e.password = (e.password || "") + " — incluye mayúscula y número";
    if (confirmPassword !== formData.password) e.confirmar = "Las contraseñas no coinciden";
    if (!formData.nombre_completo || formData.nombre_completo.trim().length < 3) e.nombre_completo = "Nombre mínimo 3 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const strengthLabel = (pwd) => {
    if (!pwd) return "vacía";
    if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return "fuerte";
    if (pwd.length >= 8) return "media";
    return "débil";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setLoading(true);
    try {
      // 1️⃣ Registrar usuario
      const res = await registerUsuario(formData);
      setMensaje(res.data.message || "✅ Usuario registrado correctamente");

      // 2️⃣ Login automático (si registro OK)
      setMensaje("✅ Usuario registrado correctamente, iniciando sesión...");
      setMessageType('success');
      const loginData = {
        username: formData.username,
        password: formData.password,
      };
      const data = await loginUsuario(loginData);

      // 3️⃣ Redirigir según rol
      if (data.usuario.rol === "administrador") navigate("/panelAdmin");
      else if (data.usuario.rol === "empleado") navigate("/panelEmpleado");
      else navigate("/perfilCliente");

      // 4️⃣ Limpiar formulario
      setFormData({
        username: "",
        email: "",
        password: "",
        nombre_completo: "",
        telefono: "",
        direccion: "",
      });
      setConfirmPassword("");
      setErrors({});
      setMessageType('success');
    } catch (err) {
      console.error(err);
      // Mostrar errores por campo si vienen del backend
      if (err.response && err.response.data) {
        const dataErr = err.response.data;
        // si es dict de campos
        if (typeof dataErr === 'object') {
          const eMap = {};
          let joined = '';
          Object.keys(dataErr).forEach((k) => {
            try {
              // campos en formato array
              eMap[k] = Array.isArray(dataErr[k]) ? dataErr[k].join(', ') : String(dataErr[k]);
              joined += `${k}: ${eMap[k]}\n`;
            } catch { joined += `${k}: ${JSON.stringify(dataErr[k])}\n`; }
          });
          setErrors(eMap);
          setMensaje(joined);
        } else {
          setMensaje(String(dataErr));
        }
      } else {
        setMensaje("❌ Error al registrar usuario o iniciar sesión");
      }
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-bg min-h-screen flex items-center justify-center relative overflow-hidden">
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
        className="registro-form relative z-10"
      >
        <div className="text-center mb-6">
          <Pill className="text-blue-600 mb-2 mx-auto" size={46} />
          <h2 className="text-3xl font-bold text-blue-800 tracking-tight">
            Registro de Usuario
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Crea tu cuenta para acceder a nuestra droguería
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="username"
              type="text"
              placeholder="Usuario (mín 3 caracteres)"
              value={formData.username}
              onChange={handleChange}
              required
              className="registro-input"
              aria-invalid={!!errors.username}
            />
            {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
          </div>

          <div>
            <input
              name="email"
              type="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
              className="registro-input"
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div className="relative">
            <input
              name="password"
              type={passwordVisible ? "text" : "password"}
              placeholder="Contraseña (mín 8 caracteres, 1 mayúscula y 1 número)"
              value={formData.password}
              onChange={handleChange}
              required
              className="registro-input pr-10"
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {passwordVisible ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
            <div className="flex items-center justify-between mt-1">
              {errors.password ? (
                <p className="text-xs text-red-600">{errors.password}</p>
              ) : (
                <p className="text-xs text-gray-500">Fortaleza: <strong className="capitalize">{strengthLabel(formData.password)}</strong></p>
              )}
            </div>
          </div>

          <div>
            <input
              name="confirm"
              type={passwordVisible ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={handleConfirm}
              required
              className="registro-input"
              aria-invalid={!!errors.confirmar}
            />
            {errors.confirmar && <p className="text-xs text-red-600 mt-1">{errors.confirmar}</p>}
          </div>

          <div>
            <input
              name="nombre_completo"
              type="text"
              placeholder="Nombre completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              required
              className="registro-input"
              aria-invalid={!!errors.nombre_completo}
            />
            {errors.nombre_completo && <p className="text-xs text-red-600 mt-1">{errors.nombre_completo}</p>}
          </div>

          <div>
            <input
              name="telefono"
              type="tel"
              placeholder="Teléfono (opcional)"
              value={formData.telefono}
              onChange={handleChange}
              className="registro-input"
            />
          </div>

          <div>
            <input
              name="direccion"
              type="text"
              placeholder="Dirección (opcional)"
              value={formData.direccion}
              onChange={handleChange}
              className="registro-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="registro-btn"
          >
            <UserPlus size={20} />
            {loading ? "Procesando..." : "Registrarse"}
          </button>
        </form>

        {/* ✅ Enlace al login */}
        <div className="text-center mt-5">
          <p className="text-gray-600 text-sm">
            ¿Ya tienes una cuenta?
          </p>
          <Link
            to="/login"
            className="registro-login-link inline-flex items-center justify-center mt-2"
          >
            <LogIn size={18} className="mr-2" />
            Iniciar sesión
          </Link>
        </div>

        {mensaje && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-5 text-center font-medium whitespace-pre-line ${
              mensaje.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {mensaje}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
