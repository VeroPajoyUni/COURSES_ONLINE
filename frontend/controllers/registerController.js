import { 
  registrarUsuario, 
  obtenerRoles, 
  obtenerTiposDocumento 
} from "../assets/js/api.js";

// Cargar roles y tipos de documento al cargar la página
window.addEventListener("DOMContentLoaded", async () => {
  await cargarRoles();
  await cargarTiposDocumento();
});

async function cargarRoles() {
  const selectRol = document.getElementById("id_rol");
  const roles = await obtenerRoles();

  roles.forEach(rol => {
    const option = document.createElement("option");
    option.value = rol.id_rol;
    option.textContent = rol.nombre_rol;
    selectRol.appendChild(option);
  });
}

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

// Manejar el envío del formulario de registro
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const contrasenia = document.getElementById("contrasenia").value;
  const confirmarContrasenia = document.getElementById("confirmar-contrasenia").value;
  const id_rol = document.getElementById("id_rol").value;
  const id_tipo_documento = document.getElementById("id_tipo_documento").value;
  const numero_identificacion = document.getElementById("numero_identificacion").value.trim();

  // Validaciones
  if (!nombre || !correo || !contrasenia || !id_rol || !id_tipo_documento || !numero_identificacion) {
    mostrarMensaje("Por favor, completa todos los campos", "error");
    return;
  }

  if (contrasenia !== confirmarContrasenia) {
    mostrarMensaje("Las contraseñas no coinciden", "error");
    return;
  }

  if (contrasenia.length < 6) {
    mostrarMensaje("La contraseña debe tener al menos 6 caracteres", "error");
    return;
  }

  // Intentar registrar
  const respuesta = await registrarUsuario(nombre, correo, contrasenia, id_rol, id_tipo_documento, numero_identificacion);

  if (respuesta.exito) {
    mostrarMensaje(respuesta.mensaje, "exito");
    
    // Redirigir al login después de 2 segundos
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 2000);
  } else {
    mostrarMensaje(respuesta.mensaje, "error");
  }
});

function mostrarMensaje(texto, tipo) {
  const mensaje = document.getElementById("mensaje");
  mensaje.textContent = texto;
  mensaje.className = `mensaje mensaje-${tipo}`;
  mensaje.style.display = "block";

  // Ocultar el mensaje después de 5 segundos si es de error
  if (tipo === "error") {
    setTimeout(() => {
      mensaje.style.display = "none";
    }, 5000);
  }
}