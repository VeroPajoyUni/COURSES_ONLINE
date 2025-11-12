/**
 * ==========================================
 * Controlador de Registro de Usuario
 * Archivo: registerController.js
 * Proyecto: OpenMind
 * Descripción:
 *   Gestiona la lógica para crear nuevas cuentas de usuario.
 *   Incluye validaciones de entrada, carga dinámica de tipos
 *   de documento desde la API y manejo visual de mensajes
 *   en el formulario de registro.
 * ==========================================
 */

import { 
  registrarUsuario, 
  obtenerTiposDocumento 
} from "../assets/js/api.js";

/* ============================================================
 *  Expresiones Regulares de Validación
 * ============================================================ */

/**
 * Expresión regular para validar el nombre completo.
 * Permite únicamente letras (mayúsculas o minúsculas), acentos
 * y espacios, evitando números o caracteres especiales.
 */
const nombreRegrex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

/**
 * Expresión regular para validar contraseñas seguras.
 * Requisitos:
 *  - Longitud entre 8 y 15 caracteres.
 *  - Al menos una letra minúscula.
 *  - Al menos una letra mayúscula.
 *  - Al menos un número.
 *  - Al menos un carácter especial (!@#$%&¿?¡.+*).
 */
const contraseniaRegrex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&¿?¡.+*])[A-Za-z\d!@#$%&¿?¡.+*]{8,15}$/;

/* ============================================================
 *  Carga inicial de tipos de documento
 * ============================================================ */

/**
 * Carga los tipos de documento desde la API cuando el DOM
 * ha terminado de cargar. Esto garantiza que el `select`
 * esté disponible antes de insertar las opciones.
 */
window.addEventListener("DOMContentLoaded", async () => {
  await cargarTiposDocumento();
});

/**
 * Solicita los tipos de documento al backend y los inserta
 * dinámicamente dentro del elemento <select> correspondiente.
 * 
 * @async
 * @function cargarTiposDocumento
 * @returns {Promise<void>}
 */
async function cargarTiposDocumento() {
  const selectTipoDoc = document.getElementById("id_tipo_documento");
  const tipos = await obtenerTiposDocumento();

  // Inserta cada tipo de documento como una opción del select
  tipos.forEach(tipo => {
    const option = document.createElement("option");
    option.value = tipo.id_tipo_documento;
    option.textContent = tipo.nombre_documento;
    selectTipoDoc.appendChild(option);
  });
}

/* ============================================================
 *  Manejador del formulario de registro
 * ============================================================ */

/**
 * Captura el evento "submit" del formulario de registro.
 * Valida los campos y envía la información al backend
 * mediante la función `registrarUsuario`.
 */
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault(); // Evita el envío tradicional del formulario

  // Obtiene los valores del formulario
  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const contrasenia = document.getElementById("contrasenia").value;
  const confirmarContrasenia = document.getElementById("confirmar-contrasenia").value;
  const id_rol = 2; // Rol por defecto para usuarios estándar
  const id_tipo_documento = document.getElementById("id_tipo_documento").value;
  const numero_identificacion = document.getElementById("numero_identificacion").value.trim();

  // ------------------------------
  // Validaciones de campos
  // ------------------------------
  if (!nombre || !correo || !contrasenia || !id_rol || !id_tipo_documento || !numero_identificacion) {
    mostrarMensaje("Por favor, completa todos los campos", "error");
    return;
  }

  if (!nombreRegrex.test(nombre)) {
    mostrarMensaje("El nombre no puede contener números ni caracteres especiales", "error");
    return;
  }

  // Validación de complejidad de contraseña
  if (!contraseniaRegrex.test(contrasenia)) {
    mostrarMensaje(
      "La contraseña debe tener entre 8 y 15 caracteres, incluir mayúsculas, minúsculas, un número y un carácter especial (!@#$%&¿?¡.+*)",
      "error"
    );
    return;
  }

  if (contrasenia !== confirmarContrasenia) {
    mostrarMensaje("Las contraseñas no coinciden", "error");
    return;
  }

  // ------------------------------
  // Envío de datos a la API
  // ------------------------------
  const respuesta = await registrarUsuario(
    nombre, 
    correo, 
    contrasenia, 
    id_rol, 
    id_tipo_documento, 
    numero_identificacion
  );

  // ------------------------------
  // Manejo de respuesta del backend
  // ------------------------------
  if (respuesta.exito) {
    mostrarMensaje("Usuario registrado correctamente, redirigiendo al login", "exito");

    // Redirige al login tras unos segundos
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 2000);
  } else {
    mostrarMensaje(respuesta.mensaje || "Error al registrar el usuario.", "error");
  }
});

/* ============================================================
 *  Función auxiliar para mostrar mensajes
 * ============================================================ */

/**
 * Muestra mensajes dinámicos de éxito o error en el formulario.
 * 
 * @param {string} texto - Contenido del mensaje a mostrar.
 * @param {"exito"|"error"} tipo - Determina el estilo visual aplicado.
 * 
 * Comportamiento:
 *  - Inserta el texto dentro del contenedor #mensaje.
 *  - Aplica clases CSS para mostrar color y formato.
 *  - Los mensajes de error desaparecen automáticamente tras 5 segundos.
 */
function mostrarMensaje(texto, tipo) {
  const mensaje = document.getElementById("mensaje");

  // Inserta texto y aplica las clases CSS
  mensaje.textContent = texto;
  mensaje.className = `mensaje mensaje-${tipo}`;
  mensaje.style.display = "block";

  // Oculta automáticamente los errores tras 5 segundos
  if (tipo === "error") {
    setTimeout(() => {
      mensaje.style.display = "none";
    }, 5000);
  }
}
