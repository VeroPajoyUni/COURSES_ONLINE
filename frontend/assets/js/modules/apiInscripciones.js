import { API_URL, fetchJSON } from "../utils/apiConfig.js";

/**
 * Función para inscribir un usuario en un curso.
 * Envía id_usuario e id_curso al backend mediante POST.
 * Retorna la respuesta con estructura { exito, data, mensaje }.
 */
export async function inscribirCurso(id_usuario, id_curso) {
  const response = await fetchJSON(`${API_URL}/inscripciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_usuario, id_curso }),
  });

  console.log("Respuesta de inscripción:", response);
  return response;
}

/**
 * Obtiene todas las inscripciones de un usuario específico.
 * Retorna { exito, data: [...inscripciones], mensaje }.
 */
export async function obtenerInscripcionesUsuario(id_usuario) {
  const response = await fetchJSON(`${API_URL}/inscripciones/usuario/${id_usuario}`);
  console.log("Inscripciones del usuario:", response);
  return response;
}

/**
 * Obtiene el detalle de una inscripción específica usando su id.
 * Retorna { exito, data: {...inscripcion}, mensaje }.
 */
export async function obtenerDetalleInscripcion(id_inscripcion) {
  const response = await fetchJSON(`${API_URL}/inscripciones/${id_inscripcion}`);
  console.log("Detalle de la inscripción obtenido:", response);
  return response;
}

/**
 * Cancela una inscripción específica usando su id.
 * Retorna { exito, data, mensaje }.
 */
export async function cancelarInscripcion(id_inscripcion) {
  const response = await fetchJSON(`${API_URL}/inscripciones/${id_inscripcion}`, {
    method: "DELETE",
  });

  console.log("Respuesta de cancelación:", response);
  return response;
}
