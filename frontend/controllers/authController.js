import { login } from "../assets/js/api.js";
import { SessionManager } from "../controllers/utils/sessionManager.js";

// ==========================
// Validaciones de seguridad
// ==========================
// Expresiones regulares para validar correo y contraseña
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==========================
// Mostrar/ocultar contraseña
// ==========================
const togglePassword = document.getElementById("togglePassword");
const inputPassword = document.getElementById("contrasenia");
if (togglePassword && inputPassword) {
  togglePassword.addEventListener("click", () => {
    const type = inputPassword.type === "password" ? "text" : "password";
    inputPassword.type = type;
    togglePassword.textContent = type === "password" ? "👁️" : "🙈";
  });
}

// ==========================
// Manejo del envío del formulario de login
// ==========================
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("correo").value.trim();
  const contrasenia = document.getElementById("contrasenia").value.trim();
  const mensajeError = document.getElementById("mensaje-error");
  mensajeError.style.display = "none";

  // Validaciones de campos
  if (!correo || !contrasenia) {
    mostrarError("Por favor, completa todos los campos");
    return;
  }
  if (!emailRegex.test(correo)) {
    mostrarError("Formato de correo electrónico no válido");
    return;
  }

  // ==========================
  // Llamada a la API de login
  // ==========================
  const respuesta = await login(correo, contrasenia);

  // ==========================
  // Manejo de la respuesta normalizada
  // ==========================
  if (respuesta.exito) {
    /**
     * El backend devuelve la estructura: { exito, mensaje, usuario }
     */
    const usuario = respuesta.data.usuario;

    // Guarda el usuario correctamente en la sesión
    SessionManager.guardarUsuario(usuario);
    window.location.href = "./index.html";
  } else {
    mostrarError(respuesta.mensaje || "Credenciales incorrectas, intenta nuevamente.");
  }
});

// ==========================
// Función auxiliar para mostrar errores
// ==========================
function mostrarError(mensaje) {
  const mensajeError = document.getElementById("mensaje-error");
  mensajeError.textContent = mensaje;
  mensajeError.style.display = "block";
}
