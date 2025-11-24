// src/pages/Reseñas.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import "./reseñas.css"; // Asegúrate de importar el CSS

export default function Reseñas() {
  const [reseñas, setReseñas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = "http://127.0.0.1:8000/api/mensajes/resenas/";

  useEffect(() => {
    const obtenerReseñas = async () => {
      try {
        const response = await axios.get(apiUrl);
        setReseñas(response.data);
      } catch (error) {
        console.error("❌ Error al cargar reseñas:", error);
        setError("No se pudieron cargar las reseñas. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    obtenerReseñas();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
          className="text-lg text-gray-600"
        >
          Cargando reseñas...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50">
        <p className="text-red-600 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="reseñas-page">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="reseñas-title"
      >
        Lo Que Dicen Nuestros Clientes
      </motion.h1>

      <p className="reseñas-subtitle">
        La satisfacción de nuestros clientes es nuestra mayor recompensa.
      </p>

      <div className="reseñas-grid">
        {reseñas.length > 0 ? (
          reseñas.map((reseña) => (
            <motion.div
              key={reseña.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="reseña-card"
            >
              <div className="quote-icon">“</div>
              
              <div className="stars-container">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={`star ${i < reseña.calificacion ? "" : "empty"}`}
                    fill={i < reseña.calificacion ? "currentColor" : "none"}
                    strokeWidth={2}
                  />
                ))}
              </div>

              <p className="reseña-text">{reseña.comentario}</p>

              <div className="client-info">
                <div className="client-avatar">
                  {reseña.nombre.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <div className="client-name">{reseña.nombre}</div>
                  <div className="client-role">{reseña.rol || "Cliente"}</div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="no-reseñas">
            No hay reseñas disponibles aún.
          </div>
        )}
      </div>
    </div>
  );
}