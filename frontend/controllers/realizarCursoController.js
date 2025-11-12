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
      li.addEventListener("click", async () => await cargarLeccion(li.dataset.id));
    });
  }

  // Cargar la primera lección por defecto y el progreso actual
  if (lecciones.length > 0) {
    await cargarLeccion(lecciones[0].id_leccion);
    await calcularProgreso(id_usuario, leccionActual.id_curso, true);
  }

  async function calcularProgreso(id_usuario, id_curso, actualizacion) {
    const resp = await leccionesCompletadas(id_usuario, id_curso);
    const lecCompletadas = resp.data.length
    const totalLecciones = lecciones.length;
    const progreso = Math.round((lecCompletadas / totalLecciones) * 100);
    if (!actualizacion) {
      return progreso
    }
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
    // Identificar si la lección ya se encuentra completada o no.
    btnCompletar.className = "btn-leccion-completada"
    btnCompletar.disable = false;
    btnCompletar.style.pointerEvents = "auto";
    if ((await leccionesCompletadas(id_usuario, leccionActual.id_curso)).data.some(item => item.id_leccion === leccionActual.id_leccion)){
      if (leccion.id_leccion === lecciones[lecciones.length-1]["id_leccion"]){
        btnCompletar.innerHTML = "Realizar Evaluación"
        if (progresoTexto!=100){
          btnCompletar.className = "btn-leccion-completada-deshabilitar"
          btnCompletar.disable = true;
          btnCompletar.style.pointerEvents = "none";
        }
      } else {
        btnCompletar.innerHTML = "Siguiente Lección"
      }
    } else {
      btnCompletar.innerHTML = "Completar Lección"
    }
  }

  // ============================
  // Marcar lección completada
  // ============================
  btnCompletar.addEventListener("click", async () => {
    if (!leccionActual) return;

    if (btnCompletar.textContent === "Completar Lección") {
      const res = await marcarLeccionCompletada(id_usuario, leccionActual.id_curso, leccionActual.id_leccion);
      if (res.exito) {
        // Actualizar progreso
        await calcularProgreso(id_usuario, leccionActual.id_curso, true);        
      } else {
        console.log("La petición NO fue exitosa.")
        mostrarModal({
          titulo: "⚠️ Error",
          mensaje: res.mensaje || "No se pudo actualizar el progreso.",
          tipo: "error",
          boton: "Cerrar",
        });
      }
    }

    // Cargar siguiente lección o evaluación
    if (leccionActual.id_leccion != lecciones[lecciones.length-1]["id_leccion"]) {
      await cargarLeccion (leccionActual.id_leccion+1)
    } else if (progresoTexto == 100) {
      mostrarModal({
        titulo:"⚠️ Error",
        mensaje: "Funcionalidad de evaluación actualmente en progreso.",
      })
    } else {
      cargarLeccion (leccionActual.id_leccion)
    }
  });
}

// ============================
// Inicialización
// ============================
window.addEventListener("DOMContentLoaded", init);
