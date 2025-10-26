// frontend/controllers/inscripcionController.js
import { inscribirCurso, obtenerInscripcionesUsuario } from "../assets/js/api.js";
import { mostrarModal } from "./modalAlertsController.js";

/**
 * Maneja todo el proceso de inscripción con las validaciones especificadas.
 */
export async function manejarInscripcion(id_usuario, id_curso, curso_finalizado) {
  // Validar si el usuario está logueado
  if (!id_usuario) {
    mostrarModal({
      titulo: "Debes iniciar sesión",
      mensaje: "Debes iniciar sesión para inscribirte en este curso.",
      tipo: "warning",
      boton: "Entendido"
    });
    return;
  }

  // Validar si el curso ya finalizó
  if (curso_finalizado) {
    mostrarModal({
      titulo: "Curso finalizado",
      mensaje: "No puedes inscribirte en un curso que ya ha finalizado.",
      tipo: "error",
      boton: "Cerrar"
    });
    return;
  }

  // Confirmación antes de inscribirse
  const confirmar = confirm("¿Deseas inscribirte en este curso?");
  if (!confirmar) return;

  const boton = document.getElementById("btnInscribirse");
  boton.disabled = true;
  boton.textContent = "Procesando...";

  // Validar si ya está inscrito
  const inscripciones = await obtenerInscripcionesUsuario(id_usuario);
  const yaInscrito = inscripciones.some(ins => ins.id_curso === Number(id_curso));

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

  // Procesar la inscripción
  const respuesta = await inscribirCurso(id_usuario, id_curso);

  if (respuesta.exito) {
    mostrarModal({
      titulo: "Inscripción exitosa",
      mensaje: "¡Te has inscrito correctamente! Ahora puedes acceder al curso desde 'Mis cursos'.",
      tipo: "success",
      boton: "Aceptar"
    });

    boton.textContent = "Inscrito";
    boton.classList.replace("btn-primary", "btn-success");
    boton.disabled = true;

    // Guardar en “Mis cursos” (localStorage temporal)
    const misCursos = JSON.parse(localStorage.getItem("misCursos")) || [];
    if (!misCursos.includes(id_curso)) {
      misCursos.push(id_curso);
      localStorage.setItem("misCursos", JSON.stringify(misCursos));
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
