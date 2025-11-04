import { API_URL, fetchJSON } from "../utils/apiConfig.js";

/**
 * Obtiene todos los cursos disponibles (vista pública o estudiante).
 */
export async function getCursos() {
  return await fetchJSON(`${API_URL}/cursos`);
}

/**
 * Obtiene el detalle de un curso por su ID.
 */
export async function getCursoDetalle(id_curso) {
  return await fetchJSON(`${API_URL}/cursos/${id_curso}`);
}

/**
 * Obtiene todas las categorías de cursos disponibles.
 */
export async function getCategorias() {
  return await fetchJSON(`${API_URL}/categorias`);
}

/**
 * Obtiene los cursos creados por un instructor específico.
 */
export async function listarCursosInstructor(id_instructor) {
  return await fetchJSON(`${API_URL}/gestion-cursos/${id_instructor}`);
}

/**
 * Crea un nuevo curso.
 */
export async function crearCurso(payload) {
  const response = await fetchJSON(`${API_URL}/cursos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.exito && !response.mensaje)
    response.mensaje = "Curso creado exitosamente.";

  return response;
}

/**
 * Actualiza un curso existente.
 */
export async function actualizarCurso(id, payload) {
  const response = await fetchJSON(`${API_URL}/cursos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.exito && !response.mensaje)
    response.mensaje = "Curso actualizado correctamente.";

  return response;
}

/**
 * Elimina un curso.
 */
export async function eliminarCurso(id) {
  const response = await fetchJSON(`${API_URL}/cursos/${id}`, {
    method: "DELETE",
  });

  if (response.exito && !response.mensaje)
    response.mensaje = "Curso eliminado exitosamente.";

  return response;
}
