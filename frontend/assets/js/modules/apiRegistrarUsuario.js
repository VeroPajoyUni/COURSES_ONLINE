import { API_URL, fetchJSON } from "../utils/apiConfig.js";

/**
 * Registra un nuevo usuario en el sistema.
 * Envía todos los datos del formulario al backend.
 * Retorna { exito, data, mensaje }.
 */
export async function registrarUsuario(nombre, correo, contrasenia, id_rol, id_tipo_documento, numero_identificacion) {
  return await fetchJSON(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, correo, contrasenia, id_rol, id_tipo_documento, numero_identificacion })
  });
}

/**
 * Obtiene la lista de roles disponibles desde el backend.
 * Retorna un arreglo de roles si la petición es exitosa, [] en caso contrario.
 */
export async function obtenerRoles() {
  const response = await fetchJSON(`${API_URL}/roles`);
  return response.exito ? response.data.roles : [];
}

/**
 * Obtiene la lista de tipos de documento disponibles desde el backend.
 * Retorna un arreglo de tipos de documento si la petición es exitosa, [] en caso contrario.
 */
export async function obtenerTiposDocumento() {
  const response = await fetchJSON(`${API_URL}/tipos-documento`);
  return response.exito ? response.data.tipos_documento : [];
}
