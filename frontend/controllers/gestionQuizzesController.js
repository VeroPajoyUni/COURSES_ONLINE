import {
  listarQuizzesPorLeccion,
  crearQuiz,
  eliminarQuiz,
  eliminarPregunta,
} from "../assets/js/api.js";
import { mostrarModal, cerrarAlertas } from "./utils/modalAlertsController.js";

const tablaBody = document.querySelector("#tablaQuizzes tbody");
const btnNuevo = document.getElementById("btnNuevoQuiz");
const modal = document.getElementById("modalQuiz");
const modalTitulo = document.getElementById("modalQuizTitulo");
const form = document.getElementById("formQuiz");
const btnGuardar = document.getElementById("btnGuardarQuiz");
const btnCerrar = document.getElementById("btnCerrarModalQuiz");
const modalConfirm = document.getElementById("modalConfirmQuiz");
const confirmMensaje = document.getElementById("confirmMensajeQuiz");
const confirmSi = document.getElementById("confirmSiQuiz");
const confirmNo = document.getElementById("confirmNoQuiz");

let quizzesCache = [];
let idLeccionActual = null;
let onConfirmAction = null;

// ================================
// INICIALIZACIÓN
// ================================
async function init() {
  const urlParams = new URLSearchParams(window.location.search);
  idLeccionActual = urlParams.get("id");

  if (!idLeccionActual) {
    document.querySelector(".gestion-quizzes-container").innerHTML =
      "<p class='no-cursos'>⚠️ No se encontró una lección asociada.</p>";
    return;
  }

  await cargarQuizzes(idLeccionActual);
  agregarEventos();
}

// ================================
// CARGA DE DATOS
// ================================
async function cargarQuizzes(id_leccion) {
  try {
    const resp = await listarQuizzesPorLeccion(id_leccion);
    if (!resp.exito) {
      mostrarModal({
        titulo: "Error",
        mensaje: "No se pudieron cargar los quizzes.",
        tipo: "error",
      });
      return;
    }

    quizzesCache = resp.data || [];
    renderTabla(quizzesCache);
  } catch (err) {
    console.error("Error cargando quizzes:", err);
    mostrarModal({
      titulo: "Error",
      mensaje: "Error al obtener quizzes desde el servidor.",
      tipo: "error",
    });
  }
}

// ================================
// RENDERIZADO DE TABLA
// ================================
function renderTabla(quizzes) {
  const tablaVacia = document.querySelector(".tabla-vacia");

  if (!quizzes.length) {
    tablaBody.innerHTML = "";
    tablaVacia.style.display = "block";
    return;
  }

  tablaVacia.style.display = "none";
  tablaBody.innerHTML = quizzes
    .map(
      (q) => `
      <tr data-id="${q.id_evaluacion}">
        <td>${q.nombre_tipo}</td>
        <td>${q.fecha_evaluacion}</td>
        <td>${q.preguntas?.length ?? 0}</td>
        <td class="acciones">
          <button class="btn-accion btn-eliminar">Eliminar</button>
          <a class="btn-accion btn-gestionar" href="gestionPreguntas.html?id=${q.id_evaluacion}">Ver preguntas</a>
        </td>
      </tr>`
    )
    .join("");
}

// ================================
// EVENTOS
// ================================
function agregarEventos() {
  btnNuevo.addEventListener("click", abrirModalNuevo);
  btnCerrar.addEventListener("click", cerrarModal);
  form.addEventListener("submit", manejarSubmit);
  tablaBody.addEventListener("click", manejarAccionesTabla);
}

// ================================
// FORMULARIO
// ================================
async function manejarSubmit(e) {
  e.preventDefault();

  try {
    const preguntas = obtenerPreguntasFormulario();
    if (!preguntas.length) {
      mostrarModal({
        titulo: "Error",
        mensaje: "Debes agregar al menos una pregunta con respuestas.",
        tipo: "error",
      });
      return;
    }

    const resp = await crearQuiz(idLeccionActual, { preguntas });

    if (resp.exito) {
      mostrarModal({
        titulo: "✅ Éxito",
        mensaje: "Quiz creado correctamente.",
        tipo: "success",
        onClose: async () => {
          cerrarModal();
          await cargarQuizzes(idLeccionActual);
        },
      });
    } else {
      mostrarModal({
        titulo: "Error",
        mensaje: resp.mensaje || "No se pudo crear el quiz.",
        tipo: "error",
      });
    }
  } catch (err) {
    console.error("Error al crear quiz:", err);
    mostrarModal({
      titulo: "Error",
      mensaje: "Error inesperado al crear el quiz.",
      tipo: "error",
    });
  }
}

function obtenerPreguntasFormulario() {
  const preguntas = [];
  const inputsPregunta = form.querySelectorAll(".pregunta-item");

  inputsPregunta.forEach((item) => {
    const texto = item.querySelector(".texto-pregunta").value.trim();
    const respuestas = [...item.querySelectorAll(".respuesta-item")].map((r) => ({
      opciones: r.querySelector(".texto-respuesta").value.trim(),
      es_correcta: r.querySelector(".radio-correcta").checked ? "true" : "false",
    }));

    if (texto && respuestas.length) {
      preguntas.push({ pregunta: texto, respuestas });
    }
  });

  return preguntas;
}

// ================================
// TABLA: ELIMINAR QUIZ
// ================================
async function manejarAccionesTabla(e) {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const id = tr.dataset.id;

  if (e.target.classList.contains("btn-eliminar")) confirmarEliminar(id);
}

function confirmarEliminar(id) {
  confirmMensaje.textContent =
    "¿Estás seguro de eliminar este quiz? Esta acción no se puede deshacer.";
  modalConfirm.style.display = "flex";

  onConfirmAction = async () => {
    const resp = await eliminarQuiz(id);

    if (resp.exito) {
      mostrarModal({
        titulo: "Éxito",
        mensaje: "Quiz eliminado exitosamente.",
        tipo: "success",
        onClose: async () => {
          await cargarQuizzes(idLeccionActual);
        },
      });
    } else {
      mostrarModal({
        titulo: "Error",
        mensaje: resp.mensaje || "No se pudo eliminar el quiz.",
        tipo: "error",
      });
    }
  };
}

confirmSi.addEventListener("click", async () => {
  modalConfirm.style.display = "none";
  if (onConfirmAction) await onConfirmAction();
});

confirmNo.addEventListener("click", () => {
  modalConfirm.style.display = "none";
  onConfirmAction = null;
});

function abrirModalNuevo() {
  cerrarAlertas();
  form.reset();
  modal.style.display = "flex";
}

function cerrarModal() {
  modal.style.display = "none";
  cerrarAlertas();
}

window.addEventListener("DOMContentLoaded", init);
