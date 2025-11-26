// src/pages/home.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { ChevronLeft, ChevronRight, ShoppingCart, Filter, X, Star, TrendingUp } from "lucide-react";
import "./home.css";

export default function Home({ carrito, setCarrito, carritoOpen, setCarritoOpen }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // filtros avanzados (servidor)
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [disponibleOnly, setDisponibleOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [valoracionMin, setValoracionMin] = useState(0);

  // Filtros
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtrosActivos, setFiltrosActivos] = useState(0);

  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const API_PEDIDOS = "http://127.0.0.1:8000/api/pedidos/crud/";

  // Calcular estadísticas del carrito
  const estadisticasCarrito = {
    cantidad: carrito.length,
    total: carrito.reduce((acc, p) => acc + (p.precio_venta * p.cantidad), 0),
    items: carrito.reduce((acc, p) => acc + p.cantidad, 0),
  };

  // Contar filtros activos
  useEffect(() => {
    let activos = 0;
    if (precioMin) activos++;
    if (precioMax) activos++;
    if (disponibleOnly) activos++;
    if (valoracionMin > 0) activos++;
    if (categoriaSeleccionada) activos++;
    setFiltrosActivos(activos);
  }, [precioMin, precioMax, disponibleOnly, valoracionMin, categoriaSeleccionada]);

  // ==========================
  // Cargar productos y categorías
  // ==========================
  useEffect(() => {
    fetchProductos();

    axios.get("http://localhost:8000/api/inventario/categorias/")
      .then((res) => setCategorias(res.data))
      .catch((err) => console.error("Error al cargar categorías:", err));
  }, []);

  // reconstruir y llamar API cuando cambian filtros relevantes
  useEffect(() => {
    const t = setTimeout(() => fetchProductos(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaSeleccionada, busqueda, precioMin, precioMax, disponibleOnly, valoracionMin, page]);

  // ==========================
  // Funciones de carrito con login requerido
  // ==========================
  const agregarAlCarrito = (producto) => {
    if (!token) {
      alert("Debes iniciar sesión para agregar productos al pedido.");
      return;
    }

    // Validar disponibilidad
    if (!producto.stock_disponible || producto.stock_disponible <= 0) {
      alert(`${producto.nombre} no está disponible en este momento.`);
      return;
    }

    const existe = carrito.find((p) => p.id === producto.id);
    if (existe) {
      // Validar no exceda stock
      if (existe.cantidad >= producto.stock_disponible) {
        alert(`No hay más stock de ${producto.nombre} disponible.`);
        return;
      }
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

  const limpiarFiltros = () => {
    setPrecioMin("");
    setPrecioMax("");
    setDisponibleOnly(false);
    setValoracionMin(0);
    setCategoriaSeleccionada(null);
    setBusqueda("");
    setPage(1);
  };

  // resetear página cuando cambian los filtros (excepto page)
  useEffect(() => {
    setPage(1);
  }, [categoriaSeleccionada, busqueda, precioMin, precioMax, disponibleOnly, valoracionMin]);

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
      setCarritoOpen(false);
    } catch (e) {
      console.error("ERROR AL ENVIAR PEDIDO:", e);
      alert("Error enviando pedido");
    }
  };

  // ==========================
  // Fetch productos desde API con filtros
  // ==========================
  const fetchProductos = async () => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize };
      if (categoriaSeleccionada) params.categoria = categoriaSeleccionada;
      if (busqueda) params.q = busqueda;
      if (precioMin) params.precio_min = precioMin;
      if (precioMax) params.precio_max = precioMax;
      if (disponibleOnly) params.disponible = true;

      const res = await axios.get("http://localhost:8000/api/inventario/catalogo/", { params });
      // es paginado — respetar estructura
      if (res.data && res.data.results) {
        setProductos(res.data.results);
        setTotalCount(res.data.count);
      } else {
        setProductos(res.data || []);
        setTotalCount(null);
      }
    } catch (err) {
      console.error("Error al cargar medicamentos:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 flex flex-col">
      {/* Bienvenida / Banner Mejorado */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-blue-600 via-teal-500 to-green-500 text-white py-12 mt-6 px-6 rounded-b-3xl shadow-xl"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-4xl font-extrabold mb-2">💊 Bienvenido a MIMS Plus</h2>
              <p className="text-blue-50 text-lg max-w-2xl">
                Medicamentos de calidad con garantía, atención especializada y envío rápido a toda Colombia
              </p>
            </div>
            {token && (
              <div className="text-right">
                <p className="text-sm text-blue-100">Hola,</p>
                <p className="font-bold text-xl">{usuario.nombre_completo || usuario.username}</p>
              </div>
            )}
          </div>
          {!token && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-yellow-300/20 border border-yellow-300 rounded-lg p-3 text-sm"
            >
              ⚠️ Inicia sesión para agregar productos a tu pedido
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto w-full px-6 py-8">
        {/* Categorías - Carrusel Mejorado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> Categorías Populares
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categorias.map((c) => (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => setCategoriaSeleccionada(categoriaSeleccionada === c.id ? null : c.id)}
                className={`flex-none px-6 py-3 rounded-full font-medium transition-all ${
                  categoriaSeleccionada === c.id
                    ? "bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg"
                    : "bg-white text-gray-700 shadow-md hover:shadow-lg border-2 border-transparent hover:border-blue-300"
                }`}
              >
                {c.nombre}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Filtros Avanzados - Panel Colapsable */}
        <motion.div
          initial={false}
          animate={{ height: mostrarFiltros ? "auto" : "0" }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden mb-6"
        >
          <motion.div
            className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: mostrarFiltros ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio Mínimo</label>
                <input
                  type="number"
                  placeholder="$0"
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500 outline-none"
                  value={precioMin}
                  onChange={(e) => setPrecioMin(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio Máximo</label>
                <input
                  type="number"
                  placeholder="$999999"
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500 outline-none"
                  value={precioMax}
                  onChange={(e) => setPrecioMax(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valoración Mín.</label>
                <select
                  value={valoracionMin}
                  onChange={(e) => setValoracionMin(Number(e.target.value))}
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500 outline-none"
                >
                  <option value="0">Todas</option>
                  <option value="1">⭐ 1+</option>
                  <option value="2">⭐⭐ 2+</option>
                  <option value="3">⭐⭐⭐ 3+</option>
                  <option value="4">⭐⭐⭐⭐ 4+</option>
                </select>
              </div>
              <div className="flex flex-col justify-end gap-2">
                <label className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border-2 border-green-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={disponibleOnly}
                    onChange={(e) => setDisponibleOnly(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Disponibles</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 items-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={limpiarFiltros}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Limpiar
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Barra de búsqueda y filtros toggle */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="🔍 Busca medicamentos, marca, dolencia..."
              className="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-blue-500 outline-none transition"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition ${
              mostrarFiltros
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500"
            }`}
          >
            <Filter size={20} />
            Filtros {filtrosActivos > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2">({filtrosActivos})</span>}
          </motion.button>
        </div>

        {/* Catálogo - Grid de Productos Mejorado */}
        <motion.div
          className="w-full pb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              <motion.div
                className="col-span-full flex justify-center items-center py-12"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <p className="text-gray-600 text-lg">⏳ Cargando medicamentos...</p>
              </motion.div>
            ) : productos.length > 0 ? (
              productos.map((p, idx) => {
                const estaVencido = new Date(p.fecha_vencimiento) < new Date();
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                    whileHover={{ y: -8 }}
                    className={`group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all overflow-hidden border-2 border-transparent hover:border-blue-300 ${
                      estaVencido ? "opacity-60" : ""
                    }`}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                      <img
                        src={p.imagen_url || "/placeholder.png"}
                        alt={p.nombre}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                      {estaVencido && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">VENCIDO</span>
                        </div>
                      )}
                      {!token && (
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs bg-black/50 px-2 py-1 rounded">Inicia sesión</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 line-clamp-2 mb-1">{p.nombre}</h3>
                      <p className="text-xs text-gray-500 mb-2">{p.descripcion}</p>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < (p.valoracion || 4) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                          />
                        ))}
                        <span className="text-xs text-gray-600 ml-1">({p.resenas_count || 0})</span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <p className="text-xl font-bold text-green-600">${p.precio_venta?.toLocaleString("es-CO")}</p>
                        {p.precio_compra && (
                          <p className="text-xs line-through text-gray-400">${p.precio_compra?.toLocaleString("es-CO")}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className={`px-2 py-1 rounded-full font-medium ${
                          p.stock_disponible > 10
                            ? "bg-green-100 text-green-700"
                            : p.stock_disponible > 0
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          Stock: {p.stock_disponible || 0}
                        </span>
                        <span className="text-gray-500 text-xs">{p.laboratorio || "—"}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!token || estaVencido || !p.stock_disponible}
                        onClick={() => agregarAlCarrito(p)}
                        className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                          !token || estaVencido || !p.stock_disponible
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        <ShoppingCart size={16} />
                        Agregar
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                className="col-span-full text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-gray-600 text-lg mb-3">❌ No hay medicamentos que coincidan con tus filtros</p>
                {filtrosActivos > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={limpiarFiltros}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Limpiar filtros
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>

          {/* Paginación Mejorada */}
          {totalCount !== null && totalCount > pageSize && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 mt-8 flex-wrap"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <ChevronLeft size={20} />
              </motion.button>
              {[...Array(Math.ceil(totalCount / pageSize))].map((_, i) => {
                const pageNum = i + 1;
                const showPage = pageNum === 1 || pageNum === Math.ceil(totalCount / pageSize) || (pageNum >= page - 1 && pageNum <= page + 1);
                return (
                  showPage && (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        pageNum === page
                          ? "bg-blue-600 text-white shadow-lg"
                          : "border-2 border-gray-300 text-gray-700 hover:border-blue-500"
                      }`}
                    >
                      {pageNum}
                    </motion.button>
                  )
                );
              })}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(totalCount / pageSize)}
                className="p-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <ChevronRight size={20} />
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Carrito Lateral Mejorado */}
      <motion.div
        initial={false}
        animate={{ x: carritoOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-screen w-96 bg-gradient-to-br from-white to-blue-50 shadow-2xl border-l-4 border-blue-500 z-50 flex flex-col"
      >
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-5 flex items-center justify-between">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart size={24} /> Mi Pedido
          </h3>
          <motion.button
            whileHover={{ scale: 1.2 }}
            onClick={() => setCarritoOpen(false)}
            className="p-1 hover:bg-white/20 rounded-lg"
          >
            <X size={24} />
          </motion.button>
        </div>

        {carrito.length > 0 ? (
          <>
            {/* Estadísticas */}
            <div className="bg-white border-b p-4 grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{estadisticasCarrito.cantidad}</p>
                <p className="text-xs text-gray-600">Productos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{estadisticasCarrito.items}</p>
                <p className="text-xs text-gray-600">Unidades</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-teal-600">${(estadisticasCarrito.total / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>

            {/* Productos */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {carrito.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg p-3 border-2 border-gray-100 hover:border-blue-300 transition"
                >
                  <p className="font-semibold text-gray-800 text-sm mb-1">{p.nombre}</p>
                  <p className="text-xs text-gray-600 mb-2">${p.precio_venta?.toLocaleString("es-CO")} x {p.cantidad}</p>
                  <p className="text-sm font-bold text-green-600 mb-2">${(p.precio_venta * p.cantidad).toLocaleString("es-CO")}</p>
                  <div className="flex gap-2 items-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex-1 bg-gray-200 text-gray-800 px-2 py-1 rounded font-bold hover:bg-gray-300"
                      onClick={() => reducirCantidad(p.id)}
                    >
                      −
                    </motion.button>
                    <span className="px-3 py-1 font-medium text-gray-800">{p.cantidad}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex-1 bg-blue-200 text-blue-800 px-2 py-1 rounded font-bold hover:bg-blue-300"
                      onClick={() => agregarAlCarrito(p)}
                    >
                      +
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 font-bold"
                      onClick={() => eliminar(p.id)}
                    >
                      ✕
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Total y Botón */}
            <div className="bg-white border-t-2 border-gray-200 p-4 space-y-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-2xl text-green-600">${estadisticasCarrito.total.toLocaleString("es-CO")}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:shadow-lg transition"
                onClick={enviarPedido}
              >
                📦 Enviar Pedido
              </motion.button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <ShoppingCart size={64} className="text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">Tu carrito está vacío</p>
            <p className="text-sm text-gray-500 mt-2">Agrega medicamentos para comenzar a comprar</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setCarritoOpen(false)}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Continuar Comprando
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Overlay para cerrar carrito */}
      {carritoOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCarritoOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Botón Carrito Flotante Mejorado */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-5 rounded-full shadow-2xl z-40 flex items-center justify-center border-4 border-blue-400"
        onClick={() => setCarritoOpen(!carritoOpen)}
        aria-label="Abrir carrito"
      >
        <ShoppingCart size={28} />
        {carrito.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {estadisticasCarrito.items}
          </span>
        )}
      </motion.button>

      {/* Footer Mejorado */}
      <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-teal-800 text-white py-8 mt-12 border-t-4 border-blue-600">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
          <div>
            <h4 className="font-bold text-lg mb-2">💊 MIMS Plus</h4>
            <p className="text-sm text-blue-100">Tu droguería de confianza desde 2015</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">Información</h4>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>✓ Envíos a toda Colombia</li>
              <li>✓ Atención al cliente 24/7</li>
              <li>✓ Medicamentos certificados</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">Contacto</h4>
            <p className="text-sm text-blue-100">📞 +57 (1) 2345-6789</p>
            <p className="text-sm text-blue-100">✉️ info@mimsplus.co</p>
          </div>
        </div>
        <div className="border-t border-blue-700 mt-6 pt-4 text-center text-sm text-blue-200">
          © 2025 MIMS Plus - Todos los derechos reservados | Sitio seguro SSL
        </div>
      </footer>
    </div>
  );
}
