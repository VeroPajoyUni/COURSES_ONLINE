import {
  listarLeccionesPorCurso,
  crearLeccion,
  actualizarLeccion,
  eliminarLeccion,
} from "../assets/js/api.js";
import { mostrarModal, cerrarAlertas } from "./utils/modalAlertsController.js";

const tablaBody = document.querySelector("#tablaLecciones tbody");
const btnNuevo = document.getElementById("btnNuevaLeccion");
const modal = document.getElementById("modalLeccion");
const modalTitulo = document.getElementById("modalLeccionTitulo");
const form = document.getElementById("formLeccion");
const btnGuardar = document.getElementById("btnGuardarLeccion");
const btnCerrar = document.getElementById("btnCerrarModalLeccion");
const modalConfirm = document.getElementById("modalConfirmLeccion");
const confirmMensaje = document.getElementById("confirmMensajeLeccion");
const confirmSi = document.getElementById("confirmSiLeccion");
const confirmNo = document.getElementById("confirmNoLeccion");

let leccionesCache = [];
let idCursoActual = null;
let editandoId = null;
let onConfirmAction = null;

// ================================
// INICIALIZACIÓN
// ================================
async function init() {
  const urlParams = new URLSearchParams(window.location.search);
  idCursoActual = urlParams.get("id");

  if (!idCursoActual) {
    document.querySelector(".gestion-lecciones-container").innerHTML =
      "<p class='no-cursos'>⚠️ No se encontró el curso asociado.</p>";
    return;
  }

  await cargarLecciones(idCursoActual);
  agregarEventos();
}

// ================================
// CARGA DE DATOS
// ================================
async function cargarLecciones(id_curso) {
  try {
    const resp = await listarLeccionesPorCurso(id_curso);
    if (!resp.exito) {
      mostrarModal({
        titulo: "Error",
        mensaje: "No se pudieron cargar las lecciones.",
        tipo: "error",
      });
      return;
    }

    leccionesCache = resp.data || [];
    renderTabla(leccionesCache);
  } catch (err) {
    console.error("Error cargando lecciones:", err);
    mostrarModal({
      titulo: "Error",
      mensaje: "Error al obtener las lecciones desde el servidor.",
      tipo: "error",
    });
  }
}

// ================================
// RENDERIZADO DE TABLA
// ================================
function renderTabla(lecciones) {
  const tablaVacia = document.querySelector(".tabla-vacia");

  if (!lecciones.length) {
    tablaBody.innerHTML = "";
    tablaVacia.style.display = "block";
    return;
  }

  tablaVacia.style.display = "none";
  tablaBody.innerHTML = lecciones
    .map(
      (l) => `
      <tr data-id="${l.id_leccion}">
        <td>${l.titulo_leccion}</td>
        <td>${l.descripcion_leccion}</td>
        <td>${l.contenido_leccion}</td>
        <td class="acciones">
          <button class="btn-accion btn-editar">Editar</button>
          <button class="btn-accion btn-eliminar">Eliminar</button>
          <a class="btn-accion btn-gestionar" href="#?id=${l.id_leccion}">Quizzes</a>
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
  form.addEventListener("input", validarFormulario);
  form.addEventListener("submit", manejarSubmit);
  tablaBody.addEventListener("click", manejarAccionesTabla);
}

// ================================
// FORMULARIO
// ================================
async function manejarSubmit(e) {
  e.preventDefault();
  const data = obtenerDatosFormulario();

  let resp;
  const accion = editandoId ? "actualizada" : "creada";

  try {
    if (editandoId) {
      resp = await actualizarLeccion(editandoId, data);
    } else {
      data.id_curso = parseInt(idCursoActual);
      resp = await crearLeccion(data);
    }

    if (resp.exito) {
      mostrarModal({
        titulo: "✅ Éxito",
        mensaje: `Lección ${accion} correctamente.`,
        tipo: "success",
        onClose: async () => {
          cerrarModal();
          await cargarLecciones(idCursoActual);
        },
      });
    } else {
      mostrarModal({
        titulo: "Error",
        mensaje: resp.mensaje || "Error al guardar la lección.",
        tipo: "error",
      });
    }
  } catch (err) {
    console.error("Error al guardar lección:", err);
    mostrarModal({
      titulo: "Error",
      mensaje: "Error inesperado al guardar la lección.",
      tipo: "error",
    });
  }
}

function obtenerDatosFormulario() {
  return {
    titulo_leccion: form.leccionTitulo.value.trim(),
    descripcion_leccion: form.leccionDescripcion.value.trim(),
    contenido_leccion: form.leccionContenido.value.trim(),
  };
}

// ================================
// TABLA: EDICIÓN Y ELIMINACIÓN
// ================================
async function manejarAccionesTabla(e) {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const id = tr.dataset.id;

  if (e.target.classList.contains("btn-editar")) await abrirModalEditar(id);
  if (e.target.classList.contains("btn-eliminar")) confirmarEliminar(id);
}

async function abrirModalEditar(id) {
  cerrarAlertas();
  const leccion = leccionesCache.find((l) => String(l.id_leccion) === String(id));
  if (!leccion) return;

  editandoId = id;
  modalTitulo.textContent = "✏️ Editar Lección";
  form.leccionTitulo.value = leccion.titulo_leccion;
  form.leccionDescripcion.value = leccion.descripcion_leccion;
  form.leccionContenido.value = leccion.contenido_leccion;
  btnGuardar.disabled = false;
  modal.style.display = "flex";
}

function confirmarEliminar(id) {
  confirmMensaje.textContent =
    "¿Estás seguro de eliminar esta lección? Esta acción no se puede deshacer.";
  modalConfirm.style.display = "flex";

  onConfirmAction = async () => {
    const resp = await eliminarLeccion(id);

    if (resp.exito) {
      mostrarModal({
        titulo: "Éxito",
        mensaje: "Lección eliminada exitosamente.",
        tipo: "success",
        onClose: async () => {
          await cargarLecciones(idCursoActual);
        },
      });
    } else {
      mostrarModal({
        titulo: "Error",
        mensaje: resp.mensaje || "No se pudo eliminar la lección.",
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

// ================================
// VALIDACIÓN Y MODALES
// ================================
function validarFormulario() {
  const titulo = form.leccionTitulo.value.trim();
  const descripcion = form.leccionDescripcion.value.trim();
  const contenido = form.leccionContenido.value.trim();
  btnGuardar.disabled = !(titulo.length > 3 && descripcion.length >= 10);
}

function abrirModalNuevo() {
  cerrarAlertas();
  editandoId = null;
  modalTitulo.textContent = "🆕 Nueva Lección";
  form.reset();
  btnGuardar.disabled = true;
  modal.style.display = "flex";
}

function cerrarModal() {
  modal.style.display = "none";
  cerrarAlertas();
}

window.addEventListener("DOMContentLoaded", init);
