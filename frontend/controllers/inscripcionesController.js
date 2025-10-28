import { inscribirCurso, obtenerInscripcionesUsuario } from "../assets/js/api.js";
import { mostrarModal } from "../controllers/utils/modalAlertsController.js";
import { SessionManager } from "../controllers/utils/sessionManager.js";

/**
 * Maneja todo el proceso de inscripción de un usuario a un curso
 * @param {number} id_curso - ID del curso al que se desea inscribir
 * @param {boolean} curso_finalizado - Indica si el curso ya ha terminado
 */
export async function manejarInscripcion(id_curso, curso_finalizado) {
  const usuario = SessionManager.obtenerUsuario();

  // Verifica si el usuario está logueado
  if (!usuario || !usuario.id_usuario) {
    mostrarModal({
      titulo: "Debes iniciar sesión",
      mensaje: "Debes iniciar sesión para inscribirte en este curso.",
      tipo: "warning",
      boton: "Entendido"
    });
    return;
  }

  const id_usuario = usuario.id_usuario;

  // Si el curso ya finalizó, no permite la inscripción
  if (curso_finalizado) {
    mostrarModal({
      titulo: "Curso finalizado",
      mensaje: "No puedes inscribirte en un curso que ya ha finalizado.",
      tipo: "error",
      boton: "Cerrar"
    });
    return;
  }

  // Confirmar con el usuario antes de inscribirse
  const confirmar = confirm("¿Deseas inscribirte en este curso?");
  if (!confirmar) return;

  const boton = document.getElementById("btnInscribirse");
  boton.disabled = true;
  boton.textContent = "Procesando...";

  // Obtiene las inscripciones del usuario
  const respuestaInscripciones = await obtenerInscripcionesUsuario(id_usuario);

  if (!respuestaInscripciones.exito) {
    mostrarModal({
      titulo: "Error al cargar inscripciones",
      mensaje: respuestaInscripciones.mensaje || "No se pudieron obtener tus inscripciones.",
      tipo: "error",
      boton: "Cerrar"
    });
    boton.disabled = false;
    boton.textContent = "Inscribirme al curso";
    return;
  }

  const inscripciones = respuestaInscripciones.data;
  const yaInscrito = inscripciones.some(ins => ins.id_curso === Number(id_curso));

  // Si ya está inscrito, muestra aviso
  if (yaInscrito) {
    mostrarModal({
      titulo: "Ya estás inscrito",
      mensaje: "Ya te encuentras inscrito en este curso.",
      tipo: "info",
      boton: "Aceptar"
    });
    boton.textContent = "Inscrito";
    boton.classList.replace("btn-primary", "btn-success");
    boton.disabled = true;
    return;
  }

  // Llama al endpoint de inscripción
  const respuesta = await inscribirCurso(id_usuario, id_curso);

  if (respuesta.exito) {
    mostrarModal({
      titulo: "Inscripción exitosa",
      mensaje: "¡Te has inscrito correctamente! Ahora puedes acceder al curso desde 'Mis cursos'.",
      tipo: "success",
      boton: "Aceptar"
    });

    // Actualiza el botón visualmente
    boton.textContent = "Inscrito";
    boton.classList.replace("btn-primary", "btn-success");
    boton.disabled = true;

    // Guarda el curso en “Mis cursos” de la sesión
    let misCursos = SessionManager.obtenerDatos("misCursos") || [];
    if (!misCursos.includes(id_curso)) {
      misCursos.push(id_curso);
      SessionManager.guardarDatos("misCursos", misCursos);
    }

  } else {
    mostrarModal({
      titulo: "Error al inscribirse",
      mensaje: respuesta.mensaje || "No se pudo completar la inscripción.",
      tipo: "error",
      boton: "Cerrar"
    });
    boton.disabled = false;
    boton.textContent = "Inscribirme al curso";
  }
}
