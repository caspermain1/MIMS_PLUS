import { useState } from "react";
import axios from "axios";

export default function Contacto() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [calificacion, setCalificacion] = useState(0); // Nueva calificación
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setExito(false);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("correo", correo);
      formData.append("asunto", asunto);
      formData.append("mensaje", mensaje);
      formData.append("calificacion", calificacion); // Enviar calificación

      const response = await axios.post(
        "http://127.0.0.1:8000/api/mensajes/mensajes/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("✅ Mensaje enviado correctamente:", response.data);
      setExito(true);
      setNombre("");
      setCorreo("");
      setAsunto("");
      setMensaje("");
      setCalificacion(0); // Reiniciar calificación
    } catch (err) {
      console.error("Error al enviar el mensaje:", err);
      setError("❌ Hubo un problema al enviar tu mensaje. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "3rem auto",
        padding: "2rem",
        backgroundColor: "#ffffff",
        borderRadius: "1rem",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "1.5rem",
          color: "#222",
          fontSize: "1.8rem",
          fontWeight: "600",
        }}
      >
        Contáctanos
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#333",
            }}
          >
            Nombre
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #ccc",
              fontSize: "1rem",
              outline: "none",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#007BFF")}
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#333",
            }}
          >
            Correo electrónico
          </label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #ccc",
              fontSize: "1rem",
              outline: "none",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#007BFF")}
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#333",
            }}
          >
            Asunto
          </label>
          <input
            type="text"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #ccc",
              fontSize: "1rem",
              outline: "none",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#007BFF")}
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#333",
            }}
          >
            Mensaje
          </label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            required
            rows="5"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #ccc",
              fontSize: "1rem",
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#007BFF")}
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          />
        </div>

        {/* Calificación con estrellas */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#333",
            }}
          >
            Calificación
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setCalificacion(star)}
                style={{
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: star <= calificacion ? "#FFD700" : "#ccc",
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={enviando}
          style={{
            width: "100%",
            backgroundColor: enviando ? "#ccc" : "#007BFF",
            color: "#fff",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: enviando ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontSize: "1rem",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => {
            if (!enviando) e.target.style.backgroundColor = "#0056b3";
          }}
          onMouseOut={(e) => {
            if (!enviando) e.target.style.backgroundColor = "#007BFF";
          }}
        >
          {enviando ? "Enviando..." : "Enviar"}
        </button>
      </form>

      {exito && (
        <p
          style={{
            color: "green",
            marginTop: "1rem",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          ✅ Mensaje enviado correctamente.
        </p>
      )}
      {error && (
        <p
          style={{
            color: "red",
            marginTop: "1rem",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          {error}
        </p>
      )}

      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f9f9f9", borderRadius: "0.5rem", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)" }}>
        <h3 style={{ marginBottom: "1rem", color: "#333", fontWeight: "600" }}>Información de Contacto</h3>
        <p style={{ marginBottom: "0.5rem", color: "#555" }}>
          <strong>Dirección:</strong> Av. Principal 123, Centro Comercial Plaza, Quito, Ecuador
        </p>
        <p style={{ marginBottom: "0.5rem", color: "#555" }}>
          <strong>Teléfono:</strong> +593 2 123 4567, +593 99 999 9999
        </p>
        <p style={{ marginBottom: "0.5rem", color: "#555" }}>
          <strong>Email:</strong> info@farmacia.com, ventas@farmacia.com
        </p>
        <p style={{ marginBottom: "0.5rem", color: "#555" }}>
          <strong>Horario de Atención:</strong>
          <br />
          Lunes a Viernes: 8:00 AM - 8:00 PM
          <br />
          Sábados: 9:00 AM - 6:00 PM
          <br />
          Domingos: 10:00 AM - 2:00 PM
        </p>
      </div>
    </div>
  );
}
