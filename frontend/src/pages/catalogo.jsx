// src/pages/Catalogo.jsx
import React, { useEffect, useState } from "react";
import { getCategoriasConMedicamentos } from "../services/inventarioServices.js";
import "./CatalogoMedicamentos.css";

const Catalogo = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [categoriaInicio, setCategoriaInicio] = useState(0); // Índice inicial para mostrar categorías

  const CATEGORIAS_VISIBLES = 5; // Número de categorías visibles a la vez

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const catConMed = await getCategoriasConMedicamentos();
        setCategorias(catConMed);
        if (catConMed.length > 0) setCategoriaActiva(catConMed[0].id); // Primera categoría activa por defecto
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("No se pudieron cargar los datos del catálogo");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Cargando catálogo...</p>;
  if (error) return <p className="error">{error}</p>;

  const manejarClickCategoria = (id) => {
    setCategoriaActiva(id);
  };

  const categoriaSeleccionada = categorias.find((cat) => cat.id === categoriaActiva);

  const moverCategoriasIzquierda = () => {
    if (categoriaInicio > 0) setCategoriaInicio(categoriaInicio - 1);
  };

  const moverCategoriasDerecha = () => {
    if (categoriaInicio + CATEGORIAS_VISIBLES < categorias.length) {
      setCategoriaInicio(categoriaInicio + 1);
    }
  };

  return (
    <div className="catalogo-container">
      {/* Botones de categorías con navegación */}
      <div className="categorias-botones">
        <button className="flecha-boton" onClick={moverCategoriasIzquierda}>
          &lt;&lt;
        </button>
        {categorias
          .slice(categoriaInicio, categoriaInicio + CATEGORIAS_VISIBLES)
          .map((cat) => (
            <button
              key={cat.id}
              className={`categoria-boton ${cat.id === categoriaActiva ? "activa" : ""}`}
              onClick={() => manejarClickCategoria(cat.id)}
            >
              {cat.nombre}
            </button>
          ))}
        <button className="flecha-boton" onClick={moverCategoriasDerecha}>
          &gt;&gt;
        </button>
      </div>

      {/* Cuadro de descripción de la categoría */}
      {categoriaSeleccionada && (
        <div className="descripcion-dialogo">
          <h2>{categoriaSeleccionada.nombre}</h2>
          <p>{categoriaSeleccionada.descripcion || "Sin descripción"}</p>
        </div>
      )}

      {/* Medicamentos de la categoría seleccionada */}
      {categoriaSeleccionada ? (
        <section className="categoria-seccion">
          <div className="medicamentos-grid">
            {categoriaSeleccionada.medicamentos && categoriaSeleccionada.medicamentos.length > 0 ? (
              categoriaSeleccionada.medicamentos.map((med) => (
                <div key={med.id} className="medicamento-card">
                  <img
                    src={med.imagen_url || '/images/default-image.png'}
                    alt={med.nombre}
                  />
                  <h3>{med.nombre}</h3>
                  <p>{med.descripcion ? med.descripcion.substring(0, 100) + "..." : "Sin descripción"}</p>
                  <p className="precio">Precio: ${med.precio_venta}</p>
                </div>
              ))
            ) : (
              <p>No hay medicamentos en esta categoría.</p>
            )}
          </div>
        </section>
      ) : (
        <p>No hay categorías disponibles.</p>
      )}
    </div>
  );
};

export default Catalogo;
