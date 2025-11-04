import { API_URL, fetchJSON } from "../utils/apiConfig.js";

/**
 * Obtiene todos los quizzes asociados a una lección.
 */
export async function listarQuizzesPorLeccion(id_leccion) {
  return await fetchJSON(`${API_URL}/quizzes/leccion/${id_leccion}`);
}

/**
 * Crea un nuevo quiz con sus preguntas y respuestas.
 */
export async function crearQuiz(id_leccion, payload) {
  const response = await fetchJSON(`${API_URL}/quizzes/leccion/${id_leccion}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.exito && !response.mensaje)
    response.mensaje = "Quiz creado exitosamente.";

  return response;
}

/**
 * Actualiza una pregunta específica del quiz.
 */
export async function actualizarPregunta(id_pregunta, payload) {
  const response = await fetchJSON(`${API_URL}/preguntas/${id_pregunta}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.exito && !response.mensaje)
    response.mensaje = "Pregunta actualizada correctamente.";

  return response;
}

/**
 * Elimina un quiz completo.
 */
export async function eliminarQuiz(id_evaluacion) {
  const response = await fetchJSON(`${API_URL}/quizzes/${id_evaluacion}`, {
    method: "DELETE",
  });

  if (response.exito && !response.mensaje)
    response.mensaje = "Quiz eliminado exitosamente.";

  return response;
}

/**
 * Elimina una pregunta individual del quiz.
 */
export async function eliminarPregunta(id_pregunta) {
  const response = await fetchJSON(`${API_URL}/preguntas/${id_pregunta}`, {
    method: "DELETE",
  });

  if (response.exito && !response.mensaje)
    response.mensaje = "Pregunta eliminada exitosamente.";

  return response;
}
