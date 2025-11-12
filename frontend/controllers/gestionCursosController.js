import { SessionManager } from "./utils/sessionManager.js";
import {
  listarCursosInstructor,
  listarLeccionesPorCurso,
  getCategorias,
  crearCurso,
  actualizarCurso,
  eliminarCurso,
} from "../assets/js/api.js";
import { mostrarModal, cerrarAlertas } from "./utils/modalAlertsController.js";

// ================================
// ELEMENTOS DEL DOM
// ================================
const tablaBody = document.querySelector("#tablaCursos tbody");
const btnNuevo = document.getElementById("btnNuevoCurso");
const modal = document.getElementById("modalCurso");
const modalTitulo = document.getElementById("modalCursoTitulo");
const form = document.getElementById("formCurso");
const btnGuardar = document.getElementById("btnGuardarCurso");
const btnCerrar = document.getElementById("btnCerrarModal");
const buscarInput = document.getElementById("buscarCurso");
const modalConfirm = document.getElementById("modalConfirm");
const confirmMensaje = document.getElementById("confirmMensaje");
const confirmSi = document.getElementById("confirmSi");
const confirmNo = document.getElementById("confirmNo");

let cursosCache = [];
let editandoId = null;
let onConfirmAction = null;

// ================================
// INICIALIZACIÓN
// ================================
async function init() {
  const usuario = SessionManager.obtenerUsuario();

  if (!usuario || usuario.rol?.toLowerCase() !== "instructor") {
    document.querySelector(".gestion-cursos-container").innerHTML =
      "<p class='no-cursos'>⚠️ Acceso no autorizado. Debes iniciar sesión como <b>Instructor</b>.</p>";
    return;
  }

  await cargarCategorias();
  await cargarCursos(usuario.id_usuario);
  agregarEventos();
}

// ================================
// CARGA DE DATOS
// ================================
async function cargarCategorias() {
  const select = document.getElementById("cursoCategoria");
  const resp = await getCategorias();

  if (resp.exito && Array.isArray(resp.data)) {
    select.innerHTML = resp.data
      .map((c) => `<option value="${c.id_categoria}">${c.nombre_categoria}</option>`)
      .join("");
  }
}

async function cargarCursos(id_instructor) {
  try {
    const resp = await listarCursosInstructor(`${id_instructor}?t=${Date.now()}`);

    if (!resp?.exito) {
      mostrarModal({
        titulo: "Error",
        mensaje: "No se pudieron cargar los cursos del instructor.",
        tipo: "error",
      });
      return;
    }

    cursosCache = Array.isArray(resp.data)
      ? resp.data.sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))
      : [];

    // Cargar el número total de lecciones para cada curso
    await agregarLeccionesACursos(cursosCache);

    renderTabla(cursosCache);
  } catch (err) {
    console.error("Error cargando cursos:", err);
    mostrarModal({
      titulo: "Error",
      mensaje: "Error al obtener los cursos desde el servidor.",
      tipo: "error",
    });
  }
}

/**
 * Función auxiliar para agregar el total de lecciones a cada curso
 */
async function agregarLeccionesACursos(cursos) {
  for (const curso of cursos) {
    try {
      const resp = await listarLeccionesPorCurso(curso.id_curso);
      curso.total_lecciones = Array.isArray(resp.data) ? resp.data.length : 0;
    } catch (error) {
      console.warn(`Error al cargar lecciones del curso ${curso.id_curso}:`, error);
      curso.total_lecciones = 0;
    }
  }
}

// ================================
// RENDERIZADO DE TABLA
// ================================
function renderTabla(cursos) {
  const tablaVacia = document.querySelector(".tabla-vacia");

  if (!cursos.length) {
    tablaBody.innerHTML = "";
    tablaVacia.style.display = "block";
    return;
  }

  tablaVacia.style.display = "none";
  tablaBody.innerHTML = cursos
    .map(
      (c) => `
      <tr data-id="${c.id_curso}">
        <td>${c.titulo_curso}</td>
        <td>${c.nombre_categoria}</td>
        <td>${c.fecha_inicio}</td>
        <td>${c.fecha_fin}</td>
        <td>${c.total_lecciones ?? 0}</td>
        <td>${c.estado ?? "Activo"}</td>
        <td class="acciones">
          <button class="btn-accion btn-editar">Editar</button>
          <button class="btn-accion btn-eliminar">Eliminar</button>
          <a class="btn-accion btn-gestionar" href="gestionLecciones.html?id=${c.id_curso}">Lecciones</a>
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
  buscarInput.addEventListener("input", filtrarCursos);
}

// ================================
// FORMULARIO
// ================================
async function manejarSubmit(e) {
  e.preventDefault();
  const data = obtenerDatosFormulario();
  const usuario = SessionManager.obtenerUsuario();

  let resp;
  const accion = editandoId ? "actualizado" : "creado";

  try {
    if (editandoId) {
      resp = await actualizarCurso(editandoId, data);
    } else {
      data.id_usuario = usuario.id_usuario;
      resp = await crearCurso(data);
    }

    await new Promise((r) => setTimeout(r, 300)); // da tiempo al backend
    await cargarCursos(usuario.id_usuario);

    mostrarModal({
      titulo: "✅ Éxito",
      mensaje: `Curso ${accion} correctamente.`,
      tipo: "success",
      onClose: () => {
        cerrarModal();
      },
    });
  } catch (err) {
    console.error("Error al guardar curso:", err);
    mostrarModal({
      titulo: "Error",
      mensaje: "Error inesperado al guardar el curso.",
      tipo: "error",
    });
  }
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

function filtrarCursos() {
  const q = buscarInput.value.trim().toLowerCase();
  const filtrado = cursosCache.filter(
    (c) =>
      c.titulo_curso.toLowerCase().includes(q) ||
      (c.nombre_categoria || "").toLowerCase().includes(q)
  );
  renderTabla(filtrado);
}

// ================================
// MODALES
// ================================
function abrirModalNuevo() {
  cerrarAlertas(); // evita overlays activos
  editandoId = null;
  modalTitulo.textContent = "🆕 Nuevo Curso";
  form.reset();
  form.cursoDescripcion.value = "";
  btnGuardar.disabled = true;
  modal.style.display = "flex";
}

async function abrirModalEditar(id) {
  cerrarAlertas(); // evita overlays activos
  const curso = cursosCache.find((c) => String(c.id_curso) === String(id));
  if (!curso) return;

  editandoId = id;
  modalTitulo.textContent = "✏️ Editar Curso";
  form.cursoTitulo.value = curso.titulo_curso;
  form.cursoDescripcion.value = curso.descripcion_curso;
  form.cursoCategoria.value = curso.id_categoria;
  form.cursoInicio.value = curso.fecha_inicio?.split("T")[0] || "";
  form.cursoFin.value = curso.fecha_fin?.split("T")[0] || "";
  btnGuardar.disabled = false;
  modal.style.display = "flex";
}

function cerrarModal() {
  modal.style.display = "none";
  cerrarAlertas(); // asegura limpieza total
}

// ================================
// VALIDACIÓN
// ================================
function validarFormulario() {
  const titulo = form.cursoTitulo.value.trim();
  const descripcion = form.cursoDescripcion.value.trim();
  const inicio = form.cursoInicio.value;
  const fin = form.cursoFin.value;

  const tituloValido = /^[A-Za-z0-9\s]+$/.test(titulo) && titulo.length > 0;
  const descValida = descripcion.length >= 30 && descripcion.length <= 500;
  const fechasValida = inicio && fin && new Date(inicio) <= new Date(fin);

  btnGuardar.disabled = !(tituloValido && descValida && fechasValida);
}

function obtenerDatosFormulario() {
  return {
    titulo_curso: form.cursoTitulo.value.trim(),
    descripcion_curso: form.cursoDescripcion.value.trim(),
    id_categoria: parseInt(form.cursoCategoria.value, 10),
    fecha_inicio: form.cursoInicio.value,
    fecha_fin: form.cursoFin.value,
  };
}

// ================================
// CONFIRMACIÓN DE ELIMINACIÓN
// ================================
function confirmarEliminar(id) {
  confirmMensaje.textContent =
    "¿Estás seguro de eliminar este curso? Esta acción no se puede deshacer.";
  modalConfirm.style.display = "flex";

  onConfirmAction = async () => {
    const resp = await eliminarCurso(id);
    const usuario = SessionManager.obtenerUsuario();

    if (resp.exito) {
      mostrarModal({
        titulo: "Éxito",
        mensaje: "Curso eliminado exitosamente.",
        tipo: "success",
        onClose: async () => {
          await cargarCursos(usuario.id_usuario);
        },
      });
    } else {
      mostrarModal({
        titulo: "Error",
        mensaje:
          resp.mensaje?.includes("usuarios inscritos")
            ? "No se puede eliminar el curso porque tiene usuarios inscritos."
            : resp.mensaje || "No se pudo eliminar el curso.",
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

window.addEventListener("DOMContentLoaded", init);
