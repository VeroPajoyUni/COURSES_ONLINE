/**
 * Controlador de cursos (cursoController.js)
 * ------------------------------------------
 * Este módulo gestiona la visualización y filtrado de los cursos disponibles
 * en la plataforma. Se encarga de comunicarse con la API para obtener los datos,
 * mostrar las tarjetas de los cursos en la interfaz, y aplicar filtros dinámicos
 * por texto o categoría.
 * 
 * Funcionalidades principales:
 *  - Cargar los cursos y las categorías desde la API.
 *  - Renderizar los cursos dinámicamente en el DOM.
 *  - Implementar filtros de búsqueda por nombre, descripción y categoría.
 *  - Formatear las fechas de los cursos para mostrarlas en formato legible.
 */

import { getCursos, getCategorias } from "../assets/js/api.js";

// ============================
// VARIABLES GLOBALES
// ============================

/**
 * @type {Array} todosLosCursos - Lista completa de cursos obtenidos desde la API.
 * @type {Array} categorias - Lista de categorías disponibles.
 */
let todosLosCursos = [];
let categorias = [];

// ============================
// FUNCIÓN PRINCIPAL DE INICIO
// ============================

/**
 * Carga inicial: obtiene los datos de cursos y categorías,
 * configura los filtros y renderiza la interfaz.
 */
async function inicializar() {
  await cargarDatos();
  configurarFiltros();
  renderizarCursos(todosLosCursos);
}

// ============================
// FUNCIONES DE CARGA DE DATOS
// ============================

/**
 * Obtiene los cursos y categorías desde la API.
 * 
 * - Llama a las funciones getCursos() y getCategorias().
 * - Si la respuesta es exitosa, almacena los datos en variables globales.
 * - Carga las opciones de categoría en el menú desplegable.
 */
async function cargarDatos() {
  // Obtener cursos desde la API
  const respuestaCursos = await getCursos();
  if (respuestaCursos.exito && respuestaCursos.data) {
    todosLosCursos = respuestaCursos.data;
  }

  // Obtener categorías desde la API
  const respuestaCategorias = await getCategorias();
  if (respuestaCategorias.exito && respuestaCategorias.data) {
    categorias = respuestaCategorias.data;
    cargarOpcionesCategorias();
  }
}

/**
 * Carga las opciones de categorías dentro del <select> de filtrado.
 */
function cargarOpcionesCategorias() {
  const selectCategoria = document.getElementById("filter-categoria");
  if (!selectCategoria) return;

  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id_categoria;
    option.textContent = cat.nombre_categoria;
    selectCategoria.appendChild(option);
  });
}

// ============================
// CONFIGURACIÓN DE FILTROS
// ============================

/**
 * Configura los eventos de filtrado en los elementos del DOM.
 * 
 * - Filtro de búsqueda por texto.
 * - Filtro por categoría seleccionada.
 */
function configurarFiltros() {
  const searchInput = document.getElementById("search-input");
  const filterCategoria = document.getElementById("filter-categoria");

  if (searchInput) {
    searchInput.addEventListener("input", aplicarFiltros);
  }

  if (filterCategoria) {
    filterCategoria.addEventListener("change", aplicarFiltros);
  }
}

/**
 * Aplica los filtros activos (texto y categoría) sobre la lista de cursos.
 * 
 * - Filtra por coincidencia en el título o descripción.
 * - Filtra por categoría seleccionada.
 * - Actualiza la visualización de los cursos.
 */
function aplicarFiltros() {
  const textoBusqueda = document.getElementById("search-input")?.value.toLowerCase() || "";
  const categoriaSeleccionada = document.getElementById("filter-categoria")?.value || "";

  let cursosFiltrados = todosLosCursos;

  // Filtro por texto (título o descripción)
  if (textoBusqueda) {
    cursosFiltrados = cursosFiltrados.filter(curso => {
      const titulo = (curso.titulo_curso || "").toLowerCase();
      const descripcion = (curso.descripcion_curso || "").toLowerCase();
      return titulo.includes(textoBusqueda) || descripcion.includes(textoBusqueda);
    });
  }

  // Filtro por categoría
  if (categoriaSeleccionada) {
    cursosFiltrados = cursosFiltrados.filter(
      curso => curso.id_categoria == categoriaSeleccionada
    );
  }

  renderizarCursos(cursosFiltrados);
}

// ============================
// RENDERIZACIÓN DE CURSOS
// ============================

/**
 * Renderiza la lista de cursos en formato de tarjetas dentro del contenedor principal.
 * 
 * @param {Array} cursos - Lista de cursos a mostrar.
 */
function renderizarCursos(cursos) {
  const contenedor = document.getElementById("cursos-container");
  if (!contenedor) return;

  // Si no hay cursos, mostrar mensaje informativo
  if (!cursos || cursos.length === 0) {
    contenedor.innerHTML = '<p class="no-results">Ups, este curso aún no existe</p>';
    return;
  }

  // Generar las tarjetas de los cursos
  contenedor.innerHTML = cursos.map(curso => `
    <div class="card">
      <div>
        <span class="categoria">${curso.nombre_categoria || "Sin categoría"}</span>
      </div>
      <h3>${curso.titulo_curso || "Sin título"}</h3>
      <p class="descripcion">${curso.descripcion_curso || "Sin descripción disponible"}</p>
      <div class="card-footer">
        <span class="fecha">📅 ${formatearFecha(curso.fecha_inicio)} - ${formatearFecha(curso.fecha_fin)}</span>
        <button>
          <a href="./previsualizarCurso.html?id=${curso.id_curso}">Ver más</a>
        </button>
      </div>
    </div>
  `).join("");
}

// ============================
// UTILIDADES
// ============================

/**
 * Formatea una fecha para mostrarse de forma legible.
 * 
 * Ejemplo: "12 nov 2025"
 * 
 * @param {string} fecha - Fecha en formato ISO o UTC.
 * @returns {string} Fecha formateada en español o "N/A" si no es válida.
 */
function formatearFecha(fecha) {
  if (!fecha) return "N/A";
  const date = new Date(fecha);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
}

// ============================
// EJECUCIÓN AUTOMÁTICA
// ============================

/**
 * Ejecuta la función de inicialización cuando el documento ha cargado.
 */
window.addEventListener("DOMContentLoaded", inicializar);
