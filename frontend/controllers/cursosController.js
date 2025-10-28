import { getCursos } from "../assets/js/api.js";

/**
 * Muestra en el DOM la lista de cursos disponibles
 */
export async function mostrarCursos() {
  const contenedor = document.getElementById("cursos-container");

  // Llama al endpoint para obtener todos los cursos
  const respuesta = await getCursos();

  // Verifica si la respuesta fue exitosa
  if (!respuesta.exito || !respuesta.data || respuesta.data.length === 0) {
    contenedor.innerHTML = "<p>No hay cursos disponibles.</p>";
    return;
  }

  // Extrae el array de cursos
  const cursos = respuesta.data;

  // Renderiza las tarjetas de cursos
  contenedor.innerHTML = cursos.map(curso => `
    <div class="card">
      <div class="card-header">
        <span class="categoria">${curso.nombre_categoria}</span>
      </div>
      <h3>${curso.titulo_curso}</h3>
      <p class="descripcion">${curso.descripcion_curso}</p>
      <div class="card-footer">
        <a href="./cursoDetalle.html?id=${curso.id_curso}" class="btn-all">Ver más</a>
      </div>
    </div>
  `).join("");
}

/**
 * Formatea una fecha en formato corto legible (dd de mes de yyyy)
 */
function formatearFecha(fecha) {
  const date = new Date(fecha);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
}

// Ejecuta la carga de cursos al cargar la página
window.addEventListener("DOMContentLoaded", mostrarCursos);
