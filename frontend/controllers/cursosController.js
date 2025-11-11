import { getCursos, getCategorias } from "../assets/js/api.js";

// Variables globales para almacenar los datos
let todosLosCursos = [];
let categorias = [];

/**
 * Carga inicial: obtiene cursos y categorías, luego renderiza
 */
async function inicializar() {
  await cargarDatos();
  configurarFiltros();
  renderizarCursos(todosLosCursos);
}

/**
 * Obtiene cursos y categorías desde la API
 */
async function cargarDatos() {
  // Obtener cursos
  const respuestaCursos = await getCursos();
  if (respuestaCursos.exito && respuestaCursos.data) {
    todosLosCursos = respuestaCursos.data;
  }

  // Obtener categorías
  const respuestaCategorias = await getCategorias();
  if (respuestaCategorias.exito && respuestaCategorias.data) {
    categorias = respuestaCategorias.data;
    cargarOpcionesCategorias();
  }
}

/**
 * Carga las opciones del select de categorías
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

/**
 * Configura los eventos de los filtros
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
 * Aplica todos los filtros activos y actualiza la vista
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

/**
 * Renderiza las tarjetas de cursos en el DOM
 */
function renderizarCursos(cursos) {
  const contenedor = document.getElementById("cursos-container");
  if (!contenedor) return;

  // Si no hay cursos, mostrar mensaje
  if (!cursos || cursos.length === 0) {
    contenedor.innerHTML = '<p class="no-results">Ups, este curso aún no existe</p>';
    return;
  }

  // Renderizar tarjetas
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

/**
 * Formatea una fecha en formato corto legible (dd de mes de yyyy)
 */
function formatearFecha(fecha) {
  if (!fecha) return "N/A";
  const date = new Date(fecha);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
}

// Ejecuta la carga de cursos al cargar la página
window.addEventListener("DOMContentLoaded", inicializar);