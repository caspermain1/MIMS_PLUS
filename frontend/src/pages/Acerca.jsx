import React from "react";
import { motion } from "framer-motion";

export default function Acerca() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-10 px-6 flex flex-col items-center">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-extrabold text-blue-700 mb-6 text-center"
      >
        Acerca de Nosotros
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl bg-white shadow-lg rounded-2xl p-8 border"
      >
        <h2 className="text-2xl font-semibold text-green-600 mb-3">
          Quiénes Somos
        </h2>
        <p className="text-gray-700 mb-5 leading-relaxed">
          En <strong>Droguería MIMS</strong> trabajamos día a día para ofrecerte los
          mejores productos farmacéuticos, naturales y de cuidado personal.
          Nuestra misión es promover el bienestar de las familias colombianas
          con un servicio confiable, rápido y humano.
        </p>

        <h3 className="text-xl font-semibold text-green-600 mb-2">
          Nuestros Valores
        </h3>
        <ul className="list-disc list-inside text-gray-700 mb-5 space-y-1">
          <li>💚 Compromiso con la salud y la calidad de vida.</li>
          <li>⚖️ Honestidad y transparencia en cada servicio.</li>
          <li>🚀 Eficiencia en la atención y entrega de productos.</li>
          <li>🌎 Responsabilidad social y ambiental.</li>
        </ul>
      </motion.div>
    </div>
  );
}
