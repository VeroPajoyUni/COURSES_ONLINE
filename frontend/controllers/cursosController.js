import { getCursos } from "../assets/js/api.js";

export async function mostrarCursos() {
  const contenedor = document.getElementById("cursos-container");

  const cursos = await getCursos();

  if (!cursos || cursos.length === 0) {
    contenedor.innerHTML = "<p>No hay cursos disponibles.</p>";
    return;
  }

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

function formatearFecha(fecha) {
  const date = new Date(fecha);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
}

window.addEventListener("DOMContentLoaded", mostrarCursos);