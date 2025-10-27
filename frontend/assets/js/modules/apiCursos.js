import { API_URL, fetchJSON } from "../utils/apiConfig.js";

export async function getCursos() {
  const response = await fetchJSON(`${API_URL}/cursos`);
  console.log("Cursos obtenidos:", response);
  return response;
}

export async function getCursoDetalle(id_curso) {
  const response = await fetchJSON(`${API_URL}/cursos/${id_curso}`);
  console.log("Detalle del curso obtenido:", response);
  return response;
}
