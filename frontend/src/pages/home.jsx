// src/pages/home.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import "./home.css";

export default function Home({ carrito, setCarrito, carritoOpen, setCarritoOpen }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Filtros
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [precioFiltro, setPrecioFiltro] = useState(""); // Filtro: "caros" o "baratos"

  const token = localStorage.getItem("token");
  const API_PEDIDOS = "http://127.0.0.1:8000/api/pedidos/crud/";

  // ==========================
  // Cargar productos y categorías
  // ==========================
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/inventario/catalogo/")
      .then((res) => setProductos(res.data))
      .catch((err) => console.error("Error al cargar medicamentos:", err));

    axios
      .get("http://localhost:8000/api/inventario/categorias/")
      .then((res) => setCategorias(res.data))
      .catch((err) => console.error("Error al cargar categorías:", err));
  }, []);

  // ==========================
  // Funciones de carrito con login requerido
  // ==========================
  const agregarAlCarrito = (producto) => {
    if (!token) {
      alert("Debes iniciar sesión para agregar productos al pedido.");
      return;
    }

    const existe = carrito.find((p) => p.id === producto.id);
    if (existe) {
      setCarrito(
        carrito.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      );
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const reducirCantidad = (id) => {
    setCarrito(
      carrito
        .map((p) => (p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p))
        .filter((p) => p.cantidad > 0)
    );
  };

  const eliminar = (id) => setCarrito(carrito.filter((p) => p.id !== id));

  const enviarPedido = async () => {
    if (!token) {
      alert("Debes iniciar sesión para enviar tu pedido.");
      return;
    }

    if (!carrito.length) return alert("El carrito está vacío");

    const detalles = carrito.map((p) => ({
      medicamento: p.id,
      cantidad: p.cantidad,
      subtotal: p.precio_venta * p.cantidad,
    }));

    const total = detalles.reduce((t, d) => t + d.subtotal, 0);

    // ✅ Obtener ID del cliente logueado (en lugar de "1")
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    const clienteId = usuario.id;

    try {
      await axios.post(
        API_PEDIDOS,
        {
          cliente: clienteId, // 👈 Ya no es 1, es el ID real
          total,
          detalles,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Pedido enviado correctamente");
      setCarrito([]); // Vaciar carrito global
    } catch (e) {
      console.error("ERROR AL ENVIAR PEDIDO:", e);
      alert("Error enviando pedido");
    }
  };

  // ==========================
  // Filtrado de productos
  // ==========================
  const productosFiltrados = productos
    .filter((p) =>
      categoriaSeleccionada ? p.categoria === categoriaSeleccionada : true
    )
    .filter((p) =>
      busqueda ? p.nombre.toLowerCase().includes(busqueda.toLowerCase()) : true
    )
    .filter((p) => {
      if (precioFiltro === "caros") return p.precio_venta > 50000; // Ejemplo: medicamentos caros > 50,000
      if (precioFiltro === "baratos") return p.precio_venta <= 50000; // Ejemplo: medicamentos baratos <= 50,000
      return true; // Sin filtro
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Bienvenida / banner */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-10 mt-6"
      >
        <h2 className="text-3xl font-extrabold text-blue-700 mb-4">
          Bienvenido a tu tienda de confianza 💊
        </h2>
        <p className="text-gray-700 max-w-xl mx-auto">
          Compra medicamentos de calidad con atención personalizada y entrega rápida.
        </p>
        {!token && (
          <p className="mt-2 text-red-600 font-semibold">
            Debes iniciar sesión para agregar productos al pedido.
          </p>
        )}
      </motion.div>

      {/* Categorías */}
      <motion.div
        className="max-w-6xl mx-auto px-6 py-6 flex gap-4 overflow-x-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {categorias.map((c) => (
          <div
            key={c.id}
            onClick={() =>
              setCategoriaSeleccionada(
                categoriaSeleccionada === c.id ? null : c.id
              )
            }
            className={`flex-none w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all
              ${
                categoriaSeleccionada === c.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 shadow-md hover:shadow-lg"
              }`}
          >
            {c.nombre}
          </div>
        ))}
      </motion.div>

      {/* Filtros */}
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Buscar por nombre"
          className="border rounded-lg p-2 flex-1"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select
          className="border rounded-lg p-2 w-40"
          value={precioFiltro}
          onChange={(e) => setPrecioFiltro(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="caros">Caros</option>
          <option value="baratos">Baratos</option>
        </select>
      </div>

      {/* Catálogo */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6 pb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white shadow-md rounded-2xl p-6 border hover:shadow-xl transition-all"
            >
              <img
                src={p.imagen_url || "/placeholder.png"}
                alt={p.nombre}
                className="w-full h-48 object-contain mb-4 rounded-lg"
              />
              <h3 className="text-lg font-semibold text-gray-800">{p.nombre}</h3>
              <p className="text-gray-500 text-sm mt-1">{p.descripcion}</p>
              <p className="mt-3 text-lg font-bold text-green-600">
                ${p.precio_venta?.toLocaleString("es-CO")}
              </p>
              <button
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                onClick={() => agregarAlCarrito(p)}
              >
                ➕ Agregar al pedido
              </button>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-600 text-lg col-span-3">
            No hay medicamentos para mostrar...
          </p>
        )}
      </motion.div>

      {/* Carrito lateral */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl border-l transition-transform duration-300 p-4 ${
          carritoOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h3 className="text-xl font-bold mb-4">🛒 Carrito</h3>

        {carrito.length > 0 ? (
          carrito.map((p) => (
            <div key={p.id} className="border-b pb-3 mb-3">
              <p className="font-semibold">{p.nombre}</p>
              <p className="text-sm text-gray-600">Cantidad: {p.cantidad}</p>

              <div className="flex gap-2 mt-2">
                <button
                  className="bg-gray-300 px-2 rounded"
                  onClick={() => reducirCantidad(p.id)}
                >
                  -
                </button>
                <button
                  className="bg-gray-300 px-2 rounded"
                  onClick={() => agregarAlCarrito(p)}
                >
                  +
                </button>
                <button
                  className="bg-red-500 text-white px-2 rounded"
                  onClick={() => eliminar(p.id)}
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Tu carrito está vacío</p>
        )}

        {carrito.length > 0 && (
          <button
            className="w-full bg-green-600 text-white py-2 rounded mt-4"
            onClick={enviarPedido}
          >
            📦 Enviar pedido
          </button>
        )}
      </div>

      {/* Botón carrito flotante */}
      <button
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg z-40"
        onClick={() => setCarritoOpen(!carritoOpen)}
        aria-label="Abrir carrito"
      >
        🛒
      </button>

      {/* Footer */}
      <footer className="bg-blue-700 text-white py-4 text-center mt-auto">
        © 2025 www.mims.co
      </footer>
    </div>
  );
}