import { login } from "../assets/js/api.js";

// Manejar el envío del formulario de login
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("correo").value.trim();
  const contrasenia = document.getElementById("contrasenia").value;
  const mensajeError = document.getElementById("mensaje-error");

  // Ocultar mensaje de error previo
  mensajeError.style.display = "none";

  // Validación básica
  if (!correo || !contrasenia) {
    mostrarError("Por favor, completa todos los campos");
    return;
  }

  // Intentar login
  const respuesta = await login(correo, contrasenia);

  if (respuesta.exito) {
    // Redirigir según el rol del usuario
    const rol = respuesta.usuario.rol.toLowerCase();
    
    if (rol === "estudiante") {
      window.location.href = "./index.html";
    } else if (rol === "instructor") {
      window.location.href = "./index.html"; // Más tarde será dashboard de instructor
    }
  } else {
    mostrarError(respuesta.mensaje);
  }
});

function mostrarError(mensaje) {
  const mensajeError = document.getElementById("mensaje-error");
  mensajeError.textContent = mensaje;
  mensajeError.style.display = "block";
}