import { API_URL, fetchJSON } from "../utils/apiConfig.js";

/**
 * Función para iniciar sesión.
 * Envía correo y contraseña al backend y recibe información del usuario.
 * Almacena los datos del usuario en sessionStorage si la autenticación es exitosa.
 */
export async function login(correo, contrasenia) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasenia }),
    });

    const data = await response.json().catch(() => ({}));

    // Si el backend respondió con error HTTP
    if (!response.ok) {
      return {
        exito: false,
        mensaje: data.mensaje || data.error || "Credenciales incorrectas. Verifica tus datos.",
      };
    }

    // Si el backend responde correctamente
    if (data.exito && data.data) {
      sessionStorage.setItem("usuario", JSON.stringify(data.data.usuario));
      console.log("Login exitoso:", data.data.usuario);
    }

    return data;
  } catch (error) {
    console.error("Error en la solicitud de login:", error);
    return { exito: false, mensaje: "Error de conexión con el servidor." };
  }
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
