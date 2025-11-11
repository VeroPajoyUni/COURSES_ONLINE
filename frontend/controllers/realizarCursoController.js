import {
  listarLeccionesPorCurso,
  marcarLeccionCompletada,
  leccionesCompletadas,
  obtenerInscripcionesUsuario
} from "../assets/js/api.js";

import { SessionManager } from "../controllers/utils/sessionManager.js";
import { mostrarModal } from "../controllers/utils/modalAlertsController.js";

// ============================
// INICIALIZACIÓN
// ============================
async function init() {
  const params = new URLSearchParams(window.location.search);
  const cursoId = parseInt(params.get("id"));
  const usuario = SessionManager.obtenerUsuario();

  if (!usuario || !usuario.id_usuario) {
    mostrarModal({
      titulo: "Debes iniciar sesión",
      mensaje: "Por favor inicia sesión para acceder al curso.",
      tipo: "warning",
      boton: "Entendido",
    });
    return;
  }

  const id_usuario = usuario.id_usuario;

  // Referencias al DOM
  const sidebar = document.querySelector("#listaLecciones");
  const contenido = document.querySelector("#contenidoLeccion");
  const btnCompletar = document.querySelector("#btnCompletarLeccion");
  const progresoBarra = document.querySelector("#progreso");
  const progresoTexto = document.querySelector("#progresoTexto");

  let lecciones = [];
  let leccionActual = null;
  let id_inscripcion = null;

  // ============================
  // Obtener inscripción del usuario
  // ============================
  const inscripcionesResp = await obtenerInscripcionesUsuario(id_usuario);
  if (inscripcionesResp.exito && Array.isArray(inscripcionesResp.data)) {
    const inscripcionCurso = inscripcionesResp.data.find(
      (i) => i.id_curso == cursoId
    );
    if (inscripcionCurso) id_inscripcion = inscripcionCurso.id_inscripcion;
  }

  if (!id_inscripcion) {
    mostrarModal({
      titulo: "Error",
      mensaje: "No se encontró tu inscripción a este curso. Por favor vuelve a inscribirte.",
      tipo: "error",
      boton: "Cerrar",
    });
    return;
  }

  // ============================
  // Cargar lecciones del curso
  // ============================
  const resp = await listarLeccionesPorCurso(cursoId);
  if (!resp.exito || !Array.isArray(resp.data)) {
    mostrarModal({
      titulo: "Error",
      mensaje: resp.mensaje || "No se pudieron cargar las lecciones del curso.",
      tipo: "error",
      boton: "Cerrar",
    });
    return;
  }

  lecciones = resp.data;
  renderSidebar(lecciones);

  // ============================
  // Renderizar sidebar de lecciones
  // ============================
  function renderSidebar(lecciones) {
    sidebar.innerHTML = lecciones
      .map(
        (l) => `
        <li data-id="${l.id_leccion}">
          ${l.titulo_leccion}
        </li>`
      )
      .join("");

    sidebar.querySelectorAll("li").forEach((li) => {
      li.addEventListener("click", () => cargarLeccion(li.dataset.id));
    });
  }

  // Cargar la primera lección por defecto y el progreso actual
  if (lecciones.length > 0) {
    cargarLeccion(lecciones[0].id_leccion);
    actualizarProgreso(id_usuario, leccionActual.id_curso);
  }

  async function actualizarProgreso(id_usuario, id_curso) {
      const resp = await leccionesCompletadas(id_usuario, id_curso);
      const lecCompletadas = resp.data.length
      const totalLecciones = lecciones.length;
      const progreso = Math.round((lecCompletadas / totalLecciones) * 100);
      progresoBarra.value = progreso;
      progresoTexto.textContent = `${progreso}%`;
  }

  // ============================
  // Cargar lección seleccionada
  // ============================
  async function cargarLeccion(id_leccion) {
    const leccion = lecciones.find((l) => l.id_leccion == id_leccion);
    if (!leccion) return;

    leccionActual = leccion;
    btnCompletar.disabled = false;

    contenido.innerHTML = `
      <h2>${leccion.titulo_leccion}</h2>
      <p>${leccion.descripcion_leccion}</p>
      <div class="contenido-leccion">
        ${
          leccion.contenido_leccion
            ? leccion.contenido_leccion.startsWith("http")
              ? `<video controls src="${leccion.contenido_leccion}"></video>`
              : `<p>${leccion.contenido_leccion}</p>`
            : "Sin contenido disponible."
        }
      </div>
    `;
  }

  // ============================
  // Marcar lección completada
  // ============================
  btnCompletar.addEventListener("click", async () => {
    if (!leccionActual) return;
    const res = await marcarLeccionCompletada(id_usuario, leccionActual.id_curso, leccionActual.id_leccion);
    if (res.exito) {
      mostrarModal({
        titulo: "✅ Éxito",
        mensaje: res.mensaje,
        tipo: "success",
        boton: "Aceptar",
      });

      // Actualizar progreso
      actualizarProgreso(id_usuario, leccionActual.id_curso);

      // TODO: Revisar si en este punto es donde se debe cambiar el botón Lección Completada por Siguiente Lección cuando la lección ya está completada.
    } else {
      mostrarModal({
        titulo: "⚠️ Error",
        mensaje: res.mensaje || "No se pudo actualizar el progreso.",
        tipo: "error",
        boton: "Cerrar",
      });
    }
  });
}

// ============================
// Inicialización
// ============================
window.addEventListener("DOMContentLoaded", init);
