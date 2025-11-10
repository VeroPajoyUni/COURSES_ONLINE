import { API_URL, fetchJSON } from "../utils/apiConfig.js";

export async function marcarLeccionCompletada(id_usuario, id_curso, id_leccion) {
  const body = { id_usuario, id_curso, id_leccion };

  const response = await fetchJSON(`${API_URL}/leccion/completar_leccion`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (response.exito && !response.mensaje)
    response.mensaje = "Progreso actualizado correctamente.";
  return response;
}

export async function leccionesCompletadas(id_usuario, id_curso) {
    const body = { id_usuario, id_curso };
    
    const response = await fetchJSON(`${API_URL}/leccion/completadas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (response.exito && !response.mensaje)
        response.mensaje = "Lecciones completadas obtenidas correctamente.";
    return response;
}