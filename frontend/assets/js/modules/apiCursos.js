import { API_URL, fetchData } from "./apiConfig.js";

export async function getCursos() {
  const data = await fetchData(`${API_URL}/cursos`);
  console.log("Cursos obtenidos:", data);
  return Array.isArray(data) ? data : [];
}

export async function getCursoDetalle(id_curso) {
  const data = await fetchData(`${API_URL}/cursos/${id_curso}`);
  console.log("Detalle del curso obtenido:", data);
  return data || null;
}
