import { API_URL, fetchData } from "./apiConfig.js";

export async function registrarUsuario(nombre, correo, contrasenia, id_rol, id_tipo_documento, numero_identificacion) {
  return await fetchData(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, correo, contrasenia, id_rol, id_tipo_documento, numero_identificacion })
  });
}

export async function obtenerRoles() {
  const data = await fetchData(`${API_URL}/roles`);
  return data["exito"] === true ? data["roles"] : [];
}

export async function obtenerTiposDocumento() {
  const data = await fetchData(`${API_URL}/tipos-documento`);
  return data["exito"] === true ? data["tipos_documento"] : [];
}
