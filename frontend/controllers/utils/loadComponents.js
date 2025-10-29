// ===============================
// CARGA GLOBAL DE HEADER Y FOOTER
// ===============================
// Este módulo se encarga de insertar dinámicamente el header y el footer en todas las páginas del proyecto, 
// además de adaptar el menú de navegación según el estado de sesión del usuario.

import { SessionManager } from "./sessionManager.js";

/**
 * Carga el contenido del header y footer en sus respectivos contenedores HTML.
 * También actualiza el header dependiendo de si hay un usuario logueado o no.
 */
export async function loadHeaderFooter() {
  const headerContainer = document.getElementById("header-container");
  const footerContainer = document.getElementById("footer-container");

  // Cargar Header dinámicamente
  if (headerContainer) {
    const headerHTML = await fetch("header.html").then(res => res.text());
    headerContainer.innerHTML = headerHTML;
    actualizarHeaderSegunSesion(); // Ajustar menú según sesión activa
  }

  // Cargar Footer dinámicamente
  if (footerContainer) {
    const footerHTML = await fetch("footer.html").then(res => res.text());
    footerContainer.innerHTML = footerHTML;
  }
}

/**
 * Actualiza el contenido del header según el estado de sesión.
 * Si hay un usuario logueado, muestra su nombre y un botón de cierre de sesión.
 * Si no, muestra los enlaces de inicio de sesión y registro.
 */
function actualizarHeaderSegunSesion() {
  const usuario = SessionManager.obtenerUsuario();
  const nav = document.querySelector(".main-nav ul");
  if (!nav) return;

  // ==========================================
  // Enlaces base del menú
  // ==========================================
  nav.innerHTML = `
    <li><a href="index.html">Inicio</a></li>
  `;

  // Verificación del rol para adaptar el menú
  if (usuario && usuario.rol?.toLowerCase() === "instructor") {
    // Si es Instructor, mostrar "Gestión de Cursos"
    nav.innerHTML += `<li><a href="gestionCursos.html">Gestión de Cursos</a></li>`;
  } else {
    // Para cualquier otro rol o visitante, mostrar "Cursos"
    nav.innerHTML += `<li><a href="index.html">Cursos</a></li>`;
  }

  // // Enlace común
  // nav.innerHTML += `<li><a href="#">Certificados</a></li>`;

  // ==========================================
  // Usuario logueado
  // ==========================================
  if (usuario) {
    // Mostrar enlace de "Mis Cursos" si no es instructor
    if (usuario.rol?.toLowerCase() !== "instructor") {
      nav.innerHTML += `<li><a href="misCursos.html">Mis cursos</a></li>`;
    }

    // Saludo personalizado
    const nombreLi = document.createElement("li");
    nombreLi.innerHTML = `<span class="user-greeting">Hola, ${usuario.nombre}!</span>`;

    // Botón de cerrar sesión
    const logoutLi = document.createElement("li");
    logoutLi.innerHTML = `
      <button id="logout-icon" class="logout-icon" title="Cerrar sesión"></button>
    `;

    // Insertar los nuevos elementos al menú
    nav.appendChild(nombreLi);
    nav.appendChild(logoutLi);

    // Acción de cierre de sesión
    document
      .getElementById("logout-icon")
      .addEventListener("click", () => SessionManager.cerrarSesion());
  } else {
    // ==========================================
    // Usuario no logueado
    // ==========================================
    nav.innerHTML += `
      <li><a href="login.html">Iniciar sesión</a></li>
      <li><a href="register.html">Registrarse</a></li>
    `;
  }
}
