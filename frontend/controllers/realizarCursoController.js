import {
  listarLeccionesPorCurso,
  listarEvaluacionesPorLeccion,
  obtenerDetalleEvaluacion,
  guardarCalificacion,
  marcarLeccionCompletada,
  leccionesCompletadas,
  obtenerInscripcionesUsuario
} from "../assets/js/api.js";

import { SessionManager } from "../controllers/utils/sessionManager.js";
import { mostrarModal } from "../controllers/utils/modalAlertsController.js";
import { iniciarQuiz } from "./quizLeccionController.js";

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
  // Verificar si todas las lecciones están completadas
  // ============================
  async function verificarTodasLeccionesCompletadas() {
    const resp = await leccionesCompletadas(id_usuario, cursoId);
    if (!resp.exito) return false;
    
    const leccionesCompletadasIds = resp.data.map(l => l.id_leccion);
    const todasCompletadas = lecciones.every(lec => 
      leccionesCompletadasIds.includes(lec.id_leccion)
    );
    
    return todasCompletadas;
  }

  // ============================
  // Buscar evaluación final del curso
  // ============================
  async function buscarEvaluacionFinalDelCurso() {
    // Buscar en todas las lecciones del curso una evaluación final
    for (const leccion of lecciones) {
      const evaluaciones = await listarEvaluacionesPorLeccion(leccion.id_leccion);
      if (evaluaciones.exito && evaluaciones.data.length > 0) {
        const evaluacionFinal = evaluaciones.data.find(
          (e) => e.tipo_evaluacion.toLowerCase() === "evaluación final" || 
                 e.tipo_evaluacion.toLowerCase() === "evaluacion final"
        );
        if (evaluacionFinal) {
          // Obtener el detalle completo de la evaluación con sus preguntas
          const detalle = await obtenerDetalleEvaluacion(evaluacionFinal.id_evaluacion);
          if (detalle.exito && detalle.data) {
            return detalle.data;
          }
        }
      }
    }
    return null;
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

    // Verificar si todas las lecciones están completadas
    const todasCompletadas = await verificarTodasLeccionesCompletadas();
    
    if (todasCompletadas) {
      // Si todas las lecciones están completadas, buscar evaluación final del curso
      const evaluacionFinal = await buscarEvaluacionFinalDelCurso();
      
      if (evaluacionFinal && evaluacionFinal.preguntas?.length > 0) {
        // Mostrar botón para evaluación final del curso
        evaluacionActual = evaluacionFinal;
        renderEvaluacion(evaluacionActual, true); // true indica que es evaluación final del curso
        return;
      } else {
        // Si no hay evaluación final, permitir completar la lección normalmente
        quizContainer.hidden = false;
        quizContainer.innerHTML = `
          <div class="quiz-presentacion">
            <div class="quiz-info">
              <h3>🎉 ¡Felicidades!</h3>
              <p class="quiz-descripcion">
                Has completado todas las lecciones del curso. 
                <strong>¡Excelente trabajo!</strong>
              </p>
            </div>
          </div>
        `;
        quizCompletado = true;
        btnCompletar.disabled = false;
        return;
      }
    }

    // Si no están todas completadas, buscar evaluación de la lección actual
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
      (e) => e.tipo_evaluacion.toLowerCase() === "evaluación final" ||
             e.tipo_evaluacion.toLowerCase() === "evaluacion final"
    );

    const evaluacionEncontrada = evaluacionQuiz || evaluacionFinal;

    if (evaluacionEncontrada) {
      // Obtener el detalle completo de la evaluación con sus preguntas
      const detalle = await obtenerDetalleEvaluacion(evaluacionEncontrada.id_evaluacion);
      if (detalle.exito && detalle.data && detalle.data.preguntas?.length > 0) {
        evaluacionActual = detalle.data;
        renderEvaluacion(evaluacionActual, false); // false indica que es de la lección
      } else {
        quizContainer.hidden = false;
        quizContainer.innerHTML = "<p>La evaluación no tiene preguntas configuradas.</p>";
        btnCompletar.disabled = false;
      }
    } else {
      quizContainer.hidden = false;
      quizContainer.innerHTML = "<p>Esta lección no tiene evaluación asociada.</p>";
      quizCompletado = true;
      btnCompletar.disabled = false;
    }
  }

  // ============================
  // Renderizar evaluación (quiz)
  // ============================
  async function renderEvaluacion(evaluacion, esEvaluacionFinalCurso = false) {
    const preguntas = evaluacion.preguntas || [];
    if (preguntas.length === 0) {
      quizContainer.hidden = false;
      quizContainer.innerHTML = "<p>Esta evaluación no tiene preguntas configuradas.</p>";
      btnCompletar.disabled = false;
      return;
    }

    // Cargar el HTML del quiz modal si no está cargado
    const quizModalContainer = document.getElementById("quiz-modal-container");
    if (!quizModalContainer.querySelector("#quiz-modal")) {
      try {
        const response = await fetch("../views/quizLeccion.html");
        const html = await response.text();
        quizModalContainer.innerHTML = html;
      } catch (error) {
        console.error("Error cargando el modal del quiz:", error);
      }
    }

    // Determinar el título y mensaje según el tipo de evaluación
    let titulo = "🧠 Quiz de la Lección";
    let descripcion = `Esta lección tiene un quiz de <strong>${preguntas.length} preguntas</strong> de verdadero/falso. Completa el quiz para avanzar en tu aprendizaje.`;
    
    if (esEvaluacionFinalCurso || evaluacion.tipo_evaluacion?.toLowerCase().includes("final")) {
      titulo = "🎓 Evaluación Final del Curso";
      descripcion = `¡Felicidades! Has completado todas las lecciones. Ahora puedes presentar la <strong>Evaluación Final</strong> con <strong>${preguntas.length} preguntas</strong> de verdadero/falso. Completa esta evaluación para finalizar el curso.`;
    } else if (evaluacion.tipo_evaluacion?.toLowerCase() === "quiz") {
      titulo = "🧠 Quiz de la Lección";
      descripcion = `Esta lección tiene un quiz de <strong>${preguntas.length} preguntas</strong> de verdadero/falso. Completa el quiz para avanzar en tu aprendizaje.`;
    }

    // Mostrar el botón para presentar el quiz
    quizContainer.hidden = false;
    quizContainer.innerHTML = `
      <div class="quiz-presentacion">
        <div class="quiz-info">
          <h3>${titulo}</h3>
          <p class="quiz-descripcion">
            ${descripcion}
          </p>
        </div>
        <div class="quiz-accion">
          <button id="btn-presentar-quiz" class="btn-presentar-quiz">
            🧠 Presentar Quiz
          </button>
        </div>
      </div>
    `;

    // Configurar el evento del botón
    const btnPresentar = document.getElementById("btn-presentar-quiz");
    if (btnPresentar) {
      btnPresentar.addEventListener("click", async () => {
        // Convertir preguntas al formato verdadero/falso
        const preguntasVF = convertirPreguntasAVerdaderoFalso(preguntas);
        
        // Iniciar el quiz con las preguntas convertidas
        iniciarQuiz(preguntasVF, evaluacion, id_usuario, () => {
          // Callback cuando se completa el quiz
          quizCompletado = true;
          btnCompletar.disabled = false;
        });
      });
    }
  }

  // ============================
  // Convertir preguntas a formato verdadero/falso
  // ============================
  function convertirPreguntasAVerdaderoFalso(preguntas) {
    // Tomar solo las primeras 5 preguntas
    return preguntas.slice(0, 5).map((p, index) => {
      // Buscar la respuesta correcta
      const respuestaCorrecta = p.respuestas?.find(
        (r) => r.es_correcta === "1" || r.es_correcta === 1 || r.es_correcta === true
      );
      
      // Determinar si la respuesta correcta es verdadero o falso
      // Analizar el texto de la respuesta correcta
      const textoCorrecto = (respuestaCorrecta?.opciones || "").toLowerCase();
      
      // Si la respuesta contiene palabras clave de verdadero
      const esVerdadero = 
        textoCorrecto.includes("verdadero") || 
        textoCorrecto.includes("true") || 
        textoCorrecto.includes("sí") ||
        textoCorrecto.includes("si") ||
        textoCorrecto.includes("correcto") ||
        textoCorrecto.includes("cierto");

      // Si solo hay 2 respuestas y una es correcta, determinar por posición
      if (p.respuestas?.length === 2) {
        const primeraEsCorrecta = p.respuestas[0]?.es_correcta === "1" || 
                                  p.respuestas[0]?.es_correcta === 1 || 
                                  p.respuestas[0]?.es_correcta === true;
        // Si la primera es correcta, asumimos que es "verdadero"
        // Si la segunda es correcta, asumimos que es "falso"
        return {
          id: p.id_preguntas || index + 1,
          pregunta: p.pregunta,
          respuestaCorrecta: primeraEsCorrecta ? "verdadero" : "falso",
          preguntaOriginal: p // Guardar referencia a la pregunta original
        };
      }

      return {
        id: p.id_preguntas || index + 1,
        pregunta: p.pregunta,
        respuestaCorrecta: esVerdadero ? "verdadero" : "falso",
        preguntaOriginal: p // Guardar referencia a la pregunta original
      };
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
    const res = await marcarLeccionCompletada(id_usuario, leccionActual.id_curso, leccionActual.id_leccion);
    if (res.exito) {
      mostrarModal({
        titulo: "✅ Éxito",
        mensaje: res.mensaje,
        tipo: "success",
        boton: "Aceptar",
      });
      
      // Actualizar progreso
      const resp = await leccionesCompletadas(id_usuario, leccionActual.id_curso);
      console.log("Lección actual:", leccionActual);
      const lecCompletadas = resp.data.length
      const totalLecciones = lecciones.length;
      const progreso = Math.round((lecCompletadas / totalLecciones) * 100);
      progresoBarra.value = progreso;
      progresoTexto.textContent = `${progreso}%`;
      console.log("[DeBug] Lecciones completadas:", lecCompletadas, "de", totalLecciones);

      // Verificar si todas las lecciones están completadas para mostrar evaluación final
      const todasCompletadas = await verificarTodasLeccionesCompletadas();
      if (todasCompletadas) {
        // Buscar y mostrar evaluación final del curso
        const evaluacionFinal = await buscarEvaluacionFinalDelCurso();
        if (evaluacionFinal && evaluacionFinal.preguntas?.length > 0) {
          evaluacionActual = evaluacionFinal;
          renderEvaluacion(evaluacionActual, true); // true indica que es evaluación final del curso
        } else {
          // Mostrar mensaje de felicitación si no hay evaluación final
          quizContainer.hidden = false;
          quizContainer.innerHTML = `
            <div class="quiz-presentacion">
              <div class="quiz-info">
                <h3>🎉 ¡Felicidades!</h3>
                <p class="quiz-descripcion">
                  Has completado todas las <strong>${totalLecciones} lecciones</strong> del curso. 
                  <strong>¡Excelente trabajo!</strong>
                </p>
              </div>
            </div>
          `;
        }
      }

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
