import { API_URL, fetchJSON } from "../utils/apiConfig.js";

/**
 * Obtiene todas las evaluaciones (quiz o finales) asociadas a una lección específica.
 * Retorna { exito, data: [...evaluaciones], mensaje }.
 */
export async function listarEvaluacionesPorLeccion(id_leccion) {
  const response = await fetchJSON(`${API_URL}/evaluaciones/leccion/${id_leccion}`);
  console.log("[Evaluaciones] Evaluaciones obtenidas por lección:", response);

  if (response.exito && !response.mensaje)
    response.mensaje = "Evaluaciones obtenidas correctamente.";

  return response;
}

/**
 * Guarda la calificación del usuario para una evaluación específica.
 * Envía { id_usuario, id_evaluacion, calificacion } mediante POST.
 * Retorna { exito, data, mensaje }.
 */
export async function guardarCalificacion(id_usuario, id_evaluacion, calificacion) {
  const body = { id_usuario, id_evaluacion, calificacion };
  const response = await fetchJSON(`${API_URL}/calificaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  console.log("[Calificaciones] Calificación guardada:", response);

  if (response.exito && !response.mensaje)
    response.mensaje = "Calificación guardada exitosamente.";

  return response;
}
