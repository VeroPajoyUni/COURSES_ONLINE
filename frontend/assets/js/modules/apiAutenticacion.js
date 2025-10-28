import { API_URL, fetchJSON } from "../utils/apiConfig.js";

/**
 * Función para iniciar sesión.
 * Envía correo y contraseña al backend y recibe información del usuario.
 * Almacena los datos del usuario en sessionStorage si la autenticación es exitosa.
 */
export async function login(correo, contrasenia) {
  const response = await fetchJSON(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasenia })
  });

  if (response.exito && response.data) {
    sessionStorage.setItem("usuario", JSON.stringify(response.data.usuario));
    console.log("Login exitoso:", response.data.usuario);
  }

  return response; // siempre devuelve { exito, data, mensaje }
}

/**
 * Función para cerrar sesión.
 * Elimina los datos del usuario de sessionStorage y redirige a login.html.
 */
export function logout() {
  sessionStorage.removeItem("usuario");
  window.location.href = "./login.html";
}

/**
 * Obtiene el usuario actualmente logueado desde sessionStorage.
 * Retorna null si no hay usuario.
 */
export function obtenerUsuarioActual() {
  const usuario = sessionStorage.getItem("usuario");
  return usuario ? JSON.parse(usuario) : null;
}

/**
 * Valida si hay un usuario autenticado.
 * Retorna true si hay un usuario logueado, false en caso contrario.
 */
export function estaAutenticado() {
  return obtenerUsuarioActual() !== null;
}
