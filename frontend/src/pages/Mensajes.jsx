import { useEffect, useState } from "react";
import axios from "axios";

export default function Mensajes() {
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroLeido, setFiltroLeido] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const API_MENSAJES = "http://127.0.0.1:8000/api/mensajes/mensajes/";
  const API_RESENAS = "http://127.0.0.1:8000/api/mensajes/resenas/";

  // Cargar mensajes desde el backend
  const obtenerMensajes = async () => {
    setCargando(true);
    try {
      const res = await axios.get(API_MENSAJES);
      let allMensajes = res.data || [];

      // Filtrar por búsqueda
      if (busqueda) {
        allMensajes = allMensajes.filter((m) =>
          m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          m.mensaje.toLowerCase().includes(busqueda.toLowerCase()) ||
          m.correo.toLowerCase().includes(busqueda.toLowerCase())
        );
      }

      // Filtrar por estado de lectura
      if (filtroLeido !== "") {
        allMensajes = allMensajes.filter((m) => m.leido === (filtroLeido === "leido"));
      }

      setTotalCount(allMensajes.length);

      // Aplicar paginación
      const inicio = (page - 1) * pageSize;
      const fin = inicio + pageSize;
      setMensajes(allMensajes.slice(inicio, fin));
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
      alert("❌ Error al cargar los mensajes desde el servidor");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerMensajes();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => obtenerMensajes(), 300);
    return () => clearTimeout(t);
  }, [busqueda, filtroLeido, page]);

  // Filtrar mensajes según la búsqueda
  const mensajesFiltrados = mensajes.filter(
    (msg) =>
      msg.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      msg.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
      msg.asunto.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 💬 Renderizado
  if (cargando) return <p className="text-center mt-8">Cargando mensajes...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        📩 Mensajes de Clientes
      </h1>

      {/* Campo de búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, correo o asunto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {mensajesFiltrados.length === 0 ? (
        <p className="text-gray-500 text-center">No hay mensajes que coincidan con la búsqueda.</p>
      ) : (
        <div className="space-y-4">
          {mensajesFiltrados.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-2xl shadow-md transition-all duration-300 ${
                msg.leido
                  ? "bg-gray-100 border border-gray-200"
                  : "bg-blue-50 border border-blue-300"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {msg.nombre}{" "}
                  <span className="text-gray-500 text-sm">
                    ({msg.correo})
                  </span>
                </h2>
                <small className="text-gray-500">
                  {new Date(msg.fecha_envio).toLocaleString()}
                </small>
              </div>

              <p className="text-gray-700">
                <strong>Asunto:</strong> {msg.asunto}
              </p>
              <p className="mt-2 text-gray-800">{msg.mensaje}</p>

              <div className="mt-3 flex gap-3">
                {/* Botón para marcar como leído */}
                {!msg.leido && (
                  <button
                    onClick={() => marcarComoLeido(msg.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                  >
                    ✅ Marcar como leído
                  </button>
                )}

                {/* Botón para publicar como reseña pública */}
                <button
                  onClick={() => publicarComoResena(msg, true)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                >
                  🌍 Publicar como reseña pública
                </button>

                {/* Botón para publicar como reseña privada */}
                <button
                  onClick={() => publicarComoResena(msg, false)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                >
                  🔒 Publicar como reseña privada
                </button>

                {/* Botón para inactivar mensaje */}
                {msg.activo && (
                  <button
                    onClick={() => inactivarMensaje(msg.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    ❌ Inactivar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
