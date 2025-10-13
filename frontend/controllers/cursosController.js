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
      <h3>${curso.titulo_curso}</h3>
      <p>${curso.descripcion_curso}</p>
      <p><strong>Instructor:</strong> ${curso.instructor}</p>
      <button>Ver más</button>
    </div>
  `).join("");
}

window.addEventListener("DOMContentLoaded", mostrarCursos);
