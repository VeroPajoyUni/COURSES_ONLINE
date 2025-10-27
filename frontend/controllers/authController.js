import { login } from "../assets/js/api.js";
import { SessionManager } from "../controllers/sessionManager.js";

// Validaciones regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&¿?¡.+*])[A-Za-z\d!@#$%&¿?¡.+*]{8,15}$/;

// Mostrar/ocultar contraseña
const togglePassword = document.getElementById("togglePassword");
const inputPassword = document.getElementById("contrasenia");
if (togglePassword && inputPassword) {
  togglePassword.addEventListener("click", () => {
    const type = inputPassword.type === "password" ? "text" : "password";
    inputPassword.type = type;
    togglePassword.textContent = type === "password" ? "👁️" : "🙈";
  });
}

// Manejar el envío del formulario
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("correo").value.trim();
  const contrasenia = document.getElementById("contrasenia").value.trim();
  const mensajeError = document.getElementById("mensaje-error");
  mensajeError.style.display = "none";

  // Validaciones
  if (!correo || !contrasenia) {
    mostrarError("Por favor, completa todos los campos");
    return;
  }

  if (!emailRegex.test(correo)) {
    mostrarError("Formato de correo electrónico no válido");
    return;
  }

  if (!passwordRegex.test(contrasenia)) {
    mostrarError("La contraseña no cumple con los requisitos de seguridad");
    return;
  }

  // Intentar login con API
  const respuesta = await login(correo, contrasenia);

  if (respuesta.exito) {
    const usuario = respuesta.usuario;

    SessionManager.guardarUsuario(usuario);

    alert("Inicio de sesión exitoso");
    window.location.href = "./index.html";
  } else {
    mostrarError("Credenciales incorrectas, intenta nuevamente.");
  }
});

function mostrarError(mensaje) {
  const mensajeError = document.getElementById("mensaje-error");
  mensajeError.textContent = mensaje;
  mensajeError.style.display = "block";
}
