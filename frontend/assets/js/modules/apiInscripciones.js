import { API_URL, fetchData } from "./apiConfig.js";

/**
 * Inscribe a un usuario en un curso
 */
export async function inscribirCurso(id_usuario, id_curso) {
  const data = await fetchData(`${API_URL}/inscripciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_usuario, id_curso }),
  });

  console.log("Respuesta de inscripción:", data);
  return data || { exito: false, mensaje: "No se pudo completar la inscripción" };
}

/**
 * Obtiene todas las inscripciones de un usuario
 */
export async function obtenerInscripcionesUsuario(id_usuario) {
  const data = await fetchData(`${API_URL}/inscripciones/usuario/${id_usuario}`);
  console.log("Inscripciones del usuario:", data);
  return Array.isArray(data) ? data : [];
}

/**
 * Obtiene el detalle de una inscripción específica
 */
export async function obtenerDetalleInscripcion(id_inscripcion) {
  const data = await fetchData(`${API_URL}/inscripciones/${id_inscripcion}`);
  console.log("Detalle de la inscripción obtenido:", data);
  return data || null;
}

/**
 * Cancela una inscripción
 */
export async function cancelarInscripcion(id_inscripcion) {
  const data = await fetchData(`${API_URL}/inscripciones/${id_inscripcion}`, {
    method: "DELETE",
  });

  console.log("Respuesta de cancelación:", data);
  return data || { exito: false, mensaje: "No se pudo cancelar la inscripción" };
}
