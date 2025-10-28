import { getCursoDetalle, inscribirCurso, obtenerInscripcionesUsuario } from "../assets/js/api.js";
import { mostrarModal } from "./utils/modalAlertsController.js";
import { SessionManager } from "./utils/sessionManager.js";

// ==========================
// Cargar previsualización de un curso
// ==========================
async function cargarPrevisualizarCurso() {
  const urlParams = new URLSearchParams(window.location.search);
  const idCurso = urlParams.get("id");

  const loading = document.getElementById("loading");
  const error = document.getElementById("error");
  const contenedor = document.getElementById("previsualizarCurso");

  if (!idCurso) {
    loading.style.display = "none";
    error.style.display = "block";
    error.querySelector("p").textContent = "No se encontró el curso solicitado.";
    return;
  }

  try {
    const respuesta = await getCursoDetalle(idCurso);

    loading.style.display = "none";

    // ==========================
    // Manejo de la respuesta normalizada
    // ==========================
    if (!respuesta.exito) {
      error.style.display = "block";
      error.querySelector("p").textContent = respuesta.mensaje || "No se pudo cargar el curso.";
      return;
    }

    const curso = respuesta.data;
    contenedor.style.display = "block";

    // ==========================
    // Renderizar información del curso en el DOM
    // ==========================
    document.getElementById("tituloCurso").textContent = curso.titulo_curso;
    document.getElementById("tituloCursoHeader").textContent = curso.titulo_curso;
    document.getElementById("categoriaCurso").textContent = curso.nombre_categoria;
    document.getElementById("descripcionCurso").textContent = curso.descripcion_curso;
    document.getElementById("instructorCurso").textContent = curso.instructor;
    document.getElementById("duracionCurso").textContent = `${formatearFecha(curso.fecha_inicio)} - ${formatearFecha(curso.fecha_fin)}`;
    document.getElementById("totalEstudiantes").textContent = `${curso.total_estudiantes} inscritos`;
    document.getElementById("totalLecciones").textContent = `${curso.total_lecciones} lecciones`;

    document.getElementById("nombreCategoria").textContent = curso.nombre_categoria;
    document.getElementById("descripcionCategoria").textContent = curso.descripcion_categoria;

    // ==========================
    // Renderizar lecciones
    // ==========================
    const listaLecciones = document.getElementById("listaLecciones");
    if (curso.lecciones && curso.lecciones.length > 0) {
      listaLecciones.innerHTML = curso.lecciones
        .map(
          (leccion, index) => `
          <div class="leccion-item">
            <div class="leccion-numero">${index + 1}</div>
            <div class="leccion-info">
              <h4>${leccion.titulo_leccion}</h4>
              <p>${leccion.descripcion_leccion}</p>
            </div>
          </div>
        `).join("");
    } else {
      listaLecciones.innerHTML = `<p class="sin-lecciones">Este curso aún no tiene lecciones disponibles.</p>`;
    }

    // ==========================
    // Botón inscribirse
    // ==========================
    const btnInscribirse = document.querySelector(".btn-inscribirse");
    const fechaActual = new Date();
    const fechaFinCurso = new Date(curso.fecha_fin);
    const usuario = SessionManager.obtenerUsuario();

    // Verificar si ya está inscrito
    if (usuario && usuario.id_usuario) {
      const respInscripciones = await obtenerInscripcionesUsuario(usuario.id_usuario);
      if (respInscripciones.exito) {
        const yaInscrito = respInscripciones.data.some(ins => ins.id_curso === parseInt(idCurso));
        if (yaInscrito) {
          btnInscribirse.textContent = "Inscrito";
          btnInscribirse.disabled = true;
          btnInscribirse.classList.add("inscrito");
        }
      }
    }

    // Manejo de clic en inscribirse
    btnInscribirse.addEventListener("click", async () => {
      const usuario = SessionManager.obtenerUsuario();

      if (!usuario || !usuario.id_usuario) {
        mostrarModal({
          titulo: "Inicia sesión para continuar",
          mensaje: "Debes iniciar sesión para inscribirte en este curso.",
          tipo: "warning",
          boton: "Entendido"
        });
        return;
      }

      if (fechaActual > fechaFinCurso) {
        mostrarModal({
          titulo: "Curso finalizado",
          mensaje: "Este curso ya ha finalizado. No es posible inscribirse.",
          tipo: "error",
          boton: "Cerrar"
        });
        return;
      }

      const respInscripciones = await obtenerInscripcionesUsuario(usuario.id_usuario);
      if (respInscripciones.exito) {
        const yaInscrito = respInscripciones.data.some(ins => ins.id_curso === parseInt(idCurso));
        if (yaInscrito) {
          mostrarModal({ 
            titulo: "Ya inscrito", 
            mensaje: "Ya estás inscrito en este curso.", 
            tipo: "warning", 
            boton: "Aceptar" 
          });
          return;
        }
      }

      mostrarModal({
        titulo: "Confirmar inscripción",
        mensaje: "¿Deseas inscribirte en este curso?",
        tipo: "info",
        boton: "Confirmar"
      });

      const modalBtn = document.querySelector(".modal-btn");
      modalBtn.addEventListener("click", async () => {
        const resultado = await inscribirCurso(usuario.id_usuario, idCurso);

        if (resultado.exito) {
          mostrarModal({ 
            titulo: "🎉 Inscripción exitosa", 
            mensaje: `¡Felicidades! Te has inscrito correctamente en ${curso.titulo_curso}.`, 
            tipo: "success", 
            boton: "Continuar" 
          });
          btnInscribirse.textContent = "Inscrito";
          btnInscribirse.disabled = true;
          btnInscribirse.classList.add("inscrito");
          agregarCursoAMisCursos(idCurso);
        } else {
          mostrarModal({ 
            titulo: "Error en la inscripción", 
            mensaje: resultado.mensaje || "No se pudo completar la inscripción. Intenta nuevamente.", 
            tipo: "error", 
            boton: "Cerrar" 
          });
        }
      }, { once: true });
    });

    // ==========================
    // Botón compartir curso
    // ==========================
    document.querySelector(".btn-compartir").addEventListener("click", () => {
      if (navigator.share) {
        navigator.share({ title: curso.titulo_curso, text: curso.descripcion_curso, url: window.location.href });
      } else {
        mostrarModal({
          titulo: "Compartir no disponible",
          mensaje: "Tu navegador no admite la función de compartir.",
          tipo: "info",
          boton: "Cerrar"
        });
      }
    });

  } catch (errorEx) {
    console.error("Error al cargar el curso:", errorEx);
    loading.style.display = "none";
    error.style.display = "block";
    error.querySelector("p").textContent = "Ocurrió un error al cargar los datos del curso.";
  }
}

// ==========================
// Funciones auxiliares
// ==========================
function formatearFecha(fecha) {
  const date = new Date(fecha);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("es-ES", options);
}

function agregarCursoAMisCursos(idCurso) {
  let misCursos = SessionManager.obtenerDatos("misCursos") || [];
  if (!misCursos.includes(idCurso)) {
    misCursos.push(idCurso);
    SessionManager.guardarDatos("misCursos", misCursos);
  }
}

// ==========================
// Inicialización
// ==========================
window.addEventListener("DOMContentLoaded", cargarPrevisualizarCurso);
