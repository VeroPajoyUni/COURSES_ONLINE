import { 
  registrarUsuario, 
  obtenerTiposDocumento 
} from "../assets/js/api.js";

// Validación de nombre de usuario
const nombreRegrex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/; // Solo letras y espacios

//  Nueva expresión regular para contraseña segura
const contraseniaRegrex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&¿?¡.+*])[A-Za-z\d!@#$%&¿?¡.+*]{8,15}$/;

/**
 * Carga automática de roles y tipos de documento al abrir la página.
 */
window.addEventListener("DOMContentLoaded", async () => {
  await cargarTiposDocumento();
});

async function cargarTiposDocumento() {
  const selectTipoDoc = document.getElementById("id_tipo_documento");
  const tipos = await obtenerTiposDocumento();

  tipos.forEach(tipo => {
    const option = document.createElement("option");
    option.value = tipo.id_tipo_documento;
    option.textContent = tipo.nombre_documento;
    selectTipoDoc.appendChild(option);
  });
}

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const contrasenia = document.getElementById("contrasenia").value;
  const confirmarContrasenia = document.getElementById("confirmar-contrasenia").value;
  const id_rol = 2;
  const id_tipo_documento = document.getElementById("id_tipo_documento").value;
  const numero_identificacion = document.getElementById("numero_identificacion").value.trim();

  // Validaciones básicas
  if (!nombre || !correo || !contrasenia || !id_rol || !id_tipo_documento || !numero_identificacion) {
    mostrarMensaje("Por favor, completa todos los campos", "error");
    return;
  }
  
  if (!nombreRegrex.test(nombre)) {
    mostrarMensaje("El nombre no puede contener números ni caracteres especiales", "error");
    return;
  }

  // Nueva validación de complejidad de contraseña
  if (!contraseniaRegrex.test(contrasenia)) {
    mostrarMensaje("La contraseña debe tener entre 8 y 15 caracteres, incluir mayúsculas, minúsculas, un número y un carácter especial (!@#$%&¿?¡.+*)", "error");
    return;
  }

  if (contrasenia !== confirmarContrasenia) {
    mostrarMensaje("Las contraseñas no coinciden", "error");
    return;
  }

  // Envío de datos a la API
  const respuesta = await registrarUsuario(
    nombre, 
    correo, 
    contrasenia, 
    id_rol, 
    id_tipo_documento, 
    numero_identificacion
  );

  if (respuesta.exito) {
    mostrarMensaje("Usuario registrado correctamene, redirigiendo al login", "exito");
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 2000);
  } else {
    mostrarMensaje(respuesta.mensaje || "Error al registrar el usuario.", "error");
  }
});

function mostrarMensaje(texto, tipo) {
  const mensaje = document.getElementById("mensaje");
  mensaje.textContent = texto;
  mensaje.className = `mensaje mensaje-${tipo}`;
  mensaje.style.display = "block";

  if (tipo === "error") {
    setTimeout(() => {
      mensaje.style.display = "none";
    }, 5000);
  }
}
