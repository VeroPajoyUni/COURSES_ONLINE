import { API_URL, fetchJSON } from "../utils/apiConfig.js";

/**
 * Obtiene todas las lecciones asociadas a un curso.
 */
export async function listarLeccionesPorCurso(id_curso) {
  return await fetchJSON(`${API_URL}/lecciones/curso/${id_curso}`);
}

/**
 * Crea una nueva lección.
 */
export async function crearLeccion(payload) {
  const response = await fetchJSON(`${API_URL}/lecciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.exito && !response.mensaje)
    response.mensaje = "Lección creada exitosamente.";

  return response;
}

/**
 * Actualiza una lección existente.
 */
export async function actualizarLeccion(id, payload) {
  const response = await fetchJSON(`${API_URL}/lecciones/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.exito && !response.mensaje)
    response.mensaje = "Lección actualizada correctamente.";

  return response;
}

/**
 * Elimina una lección.
 */
export async function eliminarLeccion(id) {
  const response = await fetchJSON(`${API_URL}/lecciones/${id}`, {
    method: "DELETE",
  });

  if (response.exito && !response.mensaje)
    response.mensaje = "Lección eliminada exitosamente.";

  return response;
}
