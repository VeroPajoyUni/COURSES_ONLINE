import {
  listarLeccionesPorCurso,
  listarEvaluacionesPorLeccion,
  guardarCalificacion,
  marcarLeccionCompletada,
  obtenerInscripcionesUsuario
} from "../assets/js/api.js";

import { SessionManager } from "../controllers/utils/sessionManager.js";
import { mostrarModal } from "../controllers/utils/modalAlertsController.js";

// ============================
// Función principal
// ============================
async function cargarRealizarCurso() {
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
  const quizContainer = document.querySelector("#quizContainer");
  const btnCompletar = document.querySelector("#btnCompletarLeccion");
  const progresoBarra = document.querySelector("#progreso");
  const progresoTexto = document.querySelector("#progresoTexto");
  const mensajeUsuario = document.querySelector("#mensajeUsuario");

  let lecciones = [];
  let leccionActual = null;
  let evaluacionActual = null;
  let quizCompletado = false;
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

  // ============================
  // Cargar lección seleccionada
  // ============================
  async function cargarLeccion(id_leccion) {
    const leccion = lecciones.find((l) => l.id_leccion == id_leccion);
    if (!leccion) return;

    leccionActual = leccion;
    quizCompletado = false;
    btnCompletar.disabled = true;
    mensajeUsuario.hidden = true;

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

    const evaluaciones = await listarEvaluacionesPorLeccion(id_leccion);
    console.log("Evaluaciones obtenidas por lección:", evaluaciones);

    if (!evaluaciones.exito || evaluaciones.data.length === 0) {
      quizContainer.hidden = false;
      quizContainer.innerHTML = "<p>Esta lección no tiene evaluación asociada.</p>";
      quizCompletado = true;
      btnCompletar.disabled = false;
      return;
    }

    const evaluacionQuiz = evaluaciones.data.find(
      (e) => e.tipo_evaluacion.toLowerCase() === "quiz"
    );
    const evaluacionFinal = evaluaciones.data.find(
      (e) => e.tipo_evaluacion.toLowerCase() === "evaluación final"
    );

    evaluacionActual = evaluacionQuiz || evaluacionFinal;

    if (evaluacionActual && evaluacionActual.preguntas?.length > 0) {
      renderEvaluacion(evaluacionActual);
    } else {
      quizContainer.hidden = false;
      quizContainer.innerHTML = "<p>La evaluación no tiene preguntas configuradas.</p>";
      btnCompletar.disabled = false;
    }
  }

  // ============================
  // Renderizar evaluación (quiz)
  // ============================
  function renderEvaluacion(evaluacion) {
    const preguntas = evaluacion.preguntas || [];
    if (preguntas.length === 0) {
      quizContainer.innerHTML = "<p>Esta evaluación no tiene preguntas configuradas.</p>";
      btnCompletar.disabled = false;
      return;
    }

    quizContainer.hidden = false;
    quizContainer.innerHTML = `
      <h3>🧠 ${
        evaluacion.tipo_evaluacion === "Quiz"
          ? "Quiz de la lección"
          : "Evaluación Final"
      }</h3>
      <form id="quizForm">
        ${preguntas
          .map(
            (p, i) => `
          <div class="pregunta">
            <p><strong>${i + 1}. ${p.pregunta}</strong></p>
            ${p.respuestas
              .map(
                (r) => `
              <label>
                <input type="radio" name="pregunta_${p.id_preguntas}" value="${r.id_respuesta}">
                ${r.opciones}
              </label>
            `
              )
              .join("")}
          </div>
        `
          )
          .join("")}
        <button type="submit" class="btn-accion">Enviar respuestas</button>
      </form>
    `;

    const form = document.querySelector("#quizForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const resultado = verificarRespuestas(preguntas);
      const payload = {
        id_usuario,
        id_evaluacion: evaluacion.id_evaluacion,
        calificacion: resultado.calificacion,
      };

      const res = await guardarCalificacion(payload);
      if (res.exito) {
        quizCompletado = true;
        btnCompletar.disabled = false;

        mostrarModal({
          titulo: "Evaluación completada",
          mensaje: `Has completado el ${evaluacion.tipo_evaluacion.toLowerCase()}. Calificación: ${resultado.calificacion.toFixed(2)}%`,
          tipo: "success",
          boton: "Continuar",
        });
      } else {
        mostrarModal({
          titulo: "Error al guardar calificación",
          mensaje: res.mensaje || "No se pudo registrar la calificación.",
          tipo: "error",
          boton: "Cerrar",
        });
      }
    });
  }

  // ============================
  // Verificar respuestas y calificar
  // ============================
  function verificarRespuestas(preguntas) {
    let correctas = 0;
    preguntas.forEach((p) => {
      const seleccionada = document.querySelector(
        `input[name="pregunta_${p.id_preguntas}"]:checked`
      )?.value;
      const correcta = p.respuestas.find(
        (r) => r.es_correcta === "1" || r.es_correcta === 1 || r.es_correcta === true
      );
      if (seleccionada == correcta?.id_respuesta) correctas++;
    });
    const total = preguntas.length;
    const calificacion = (correctas / total) * 100;
    return { correctas, total, calificacion };
  }

  // ============================
  // Marcar lección completada
  // ============================
  btnCompletar.addEventListener("click", async () => {
    if (!leccionActual) return;
    console.log("[DeBug] Evento de clic activado.", leccionActual)

    const res = await marcarLeccionCompletada(id_usuario, leccionActual.id_curso, leccionActual.id_leccion);
    console.log("[DeBug] Respuesta de la API recibida.", res)
    if (res.exito) {
      mostrarModal({
        titulo: "✅ Éxito",
        mensaje: res.mensaje,
        tipo: "success",
        boton: "Aceptar",
      });

      if (res.data?.progreso !== undefined) {
        progresoBarra.value = res.data.progreso;
        progresoTexto.textContent = `${res.data.progreso}%`;
      }

      mensajeUsuario.textContent = "Lección completada correctamente.";
      mensajeUsuario.classList.add("exito");
      mensajeUsuario.hidden = false;
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
window.addEventListener("DOMContentLoaded", cargarRealizarCurso);
