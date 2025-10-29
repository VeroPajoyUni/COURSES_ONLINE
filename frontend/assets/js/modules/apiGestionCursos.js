import { API_URL, fetchJSON } from "../utils/apiConfig.js";

export async function listarCursosInstructor(id_instructor) {
  const response =  await fetchJSON(`${API_URL}/gestion-cursos/${id_instructor}`);
  return response;
}

export async function crearCurso(data) {
  return await fetchJSON(`${API_URL}/gestion-cursos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function actualizarCurso(id_curso, data) {
  return await fetchJSON(`${API_URL}/gestion-cursos/${id_curso}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function eliminarCurso(id_curso) {
  return await fetchJSON(`${API_URL}/gestion-cursos/${id_curso}`, {
    method: "DELETE",
  });
}
