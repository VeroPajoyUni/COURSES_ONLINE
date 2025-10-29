import { API_URL, fetchJSON } from "../utils/apiConfig.js";

export async function getCursos() {
  const response = await fetchJSON(`${API_URL}/cursos`);
  // console.log("Cursos obtenidos:", response);
  return response;
}

export async function getCursoDetalle(id_curso) {
  const response = await fetchJSON(`${API_URL}/cursos/${id_curso}`);
  // console.log("Detalle del curso obtenido:", response);
  return response;
}

export async function getCategorias(){
  const response = await fetchJSON(`${API_URL}/categorias`);
  console.log("Categorias obtenidas:", response);
  return response;
}

export async function crearCurso(payload){
  return await fetchJSON(`${API_URL}/cursos`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
}

export async function actualizarCurso(id, payload){
  return await fetchJSON(`${API_URL}/cursos/${id}`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
}

export async function eliminarCurso(id){
  const response = await fetchJSON(`${API_URL}/cursos/${id}`, { method: 'DELETE' });
  return response;
}
