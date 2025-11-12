/**
 * ==========================================
 * Controlador de Autenticación (Login)
 * Archivo: authController.js
 * Proyecto: OpenMind
 * Descripción:
 *   Gestiona la lógica del inicio de sesión de los usuarios,
 *   incluyendo validaciones de entrada, conexión con la API,
 *   manejo de sesión y visualización de mensajes en pantalla.
 * ==========================================
 */

import { login } from "../assets/js/api.js";
import { SessionManager } from "../controllers/utils/sessionManager.js";

/* ============================================================
 *  Validaciones y configuración inicial
 * ============================================================ */

/**
 * Expresión regular para validar el formato del correo electrónico.
 * Asegura que tenga un usuario, un dominio y una extensión válida.
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ============================================================
 *  Mostrar / Ocultar contraseña
 * ============================================================ */

/**
 * Permite alternar la visibilidad del campo de contraseña
 * (mostrar texto o mantenerlo oculto con asteriscos).
 */
const togglePassword = document.getElementById("togglePassword");
const inputPassword = document.getElementById("contrasenia");

if (togglePassword && inputPassword) {
  togglePassword.addEventListener("click", () => {
    // Cambia el tipo de input entre "password" y "text"
    const type = inputPassword.type === "password" ? "text" : "password";
    inputPassword.type = type;

    // Cambia el ícono visual según el estado
    togglePassword.textContent = type === "password" ? "👁️" : "🙈";
  });
}

/* ============================================================
 *  Manejador del formulario de inicio de sesión
 * ============================================================ */

/**
 * Captura el evento "submit" del formulario de login y ejecuta
 * las validaciones correspondientes antes de llamar a la API.
 */
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault(); // Evita el envío tradicional del formulario

  const correo = document.getElementById("correo").value.trim();
  const contrasenia = document.getElementById("contrasenia").value.trim();

  // ------------------------------
  // Validaciones básicas del formulario
  // ------------------------------
  if (!correo || !contrasenia) {
    mostrarMensaje("Por favor, completa todos los campos", "error");
    return;
  }

  if (!emailRegex.test(correo)) {
    mostrarMensaje("Formato de correo electrónico no válido", "error");
    return;
  }

  // ------------------------------
  // Llamada al backend para autenticación
  // ------------------------------
  const respuesta = await login(correo, contrasenia);

  // ------------------------------
  // Manejo de respuesta de la API
  // ------------------------------
  if (respuesta.exito) {
    /**
     * Estructura esperada del backend:
     * { exito: true, mensaje: string, data: { ...usuario } }
     */
    const usuario = respuesta.data;

    // Guarda los datos del usuario autenticado en sesión
    SessionManager.guardarUsuario(usuario);

    // Muestra mensaje de éxito y redirige tras unos segundos
    mostrarMensaje("Inicio de sesión exitoso, redirigiendo...", "exito");
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 2000);
  } else {
    // Muestra mensaje de error genérico o el proporcionado por el backend
    mostrarMensaje(respuesta.mensaje || "Credenciales incorrectas, intenta nuevamente.", "error");
  }
});

/* ============================================================
 *  Función auxiliar para mostrar mensajes en pantalla
 * ============================================================ */

/**
 * Muestra mensajes de éxito o error en el formulario.
 * 
 * @param {string} texto - Contenido del mensaje a mostrar.
 * @param {"exito"|"error"} tipo - Define el estilo del mensaje.
 * 
 * Funcionalidad:
 * - Inserta el texto en el contenedor #mensaje.
 * - Aplica clases CSS para cambiar color y formato.
 * - Oculta automáticamente los mensajes de error tras 5 segundos.
 */
function mostrarMensaje(texto, tipo) {
  const mensaje = document.getElementById("mensaje");

  // Establece el texto del mensaje
  mensaje.textContent = texto;

  // Aplica las clases dinámicas para los estilos (CSS)
  mensaje.className = `mensaje mensaje-${tipo}`;

  // Hace visible el contenedor del mensaje
  mensaje.style.display = "block";

  // Los mensajes de error desaparecen automáticamente
  if (tipo === "error") {
    setTimeout(() => {
      mensaje.style.display = "none";
    }, 5000);
  }
}
