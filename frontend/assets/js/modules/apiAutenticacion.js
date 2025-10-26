import { API_URL, fetchData } from "./apiConfig.js";

export async function login(correo, contrasenia) {
  const data = await fetchData(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasenia })
  });

  if (data.exito) {
    // Guardar datos del usuario en sessionStorage
    sessionStorage.setItem("usuario", JSON.stringify(data.usuario));
    console.log("Login exitoso:", data.usuario);
  }

  return data;
}

export function logout() {
  sessionStorage.removeItem("usuario");
  window.location.href = "./login.html";
}

export function obtenerUsuarioActual() {
  const usuario = sessionStorage.getItem("usuario");
  return usuario ? JSON.parse(usuario) : null;
}

export function estaAutenticado() {
  return obtenerUsuarioActual() !== null;
}
