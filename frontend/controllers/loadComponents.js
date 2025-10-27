import { SessionManager } from "../controllers/sessionManager.js";

export async function loadHeaderFooter() {
  const headerContainer = document.getElementById("header-container");
  const footerContainer = document.getElementById("footer-container");

  // Cargar Header
  if (headerContainer) {
    const headerHTML = await fetch("header.html").then(res => res.text());
    headerContainer.innerHTML = headerHTML;
    actualizarHeaderSegunSesion();
  }

  // Cargar Footer
  if (footerContainer) {
    const footerHTML = await fetch("footer.html").then(res => res.text());
    footerContainer.innerHTML = footerHTML;
  }
}

function actualizarHeaderSegunSesion() {
  const usuario = SessionManager.obtenerUsuario();
  const nav = document.querySelector(".main-nav ul");
  if (!nav) return;

  // Enlaces comunes
  nav.innerHTML = `
    <li><a href="index.html">Inicio</a></li>
    <li><a href="cursoDetalle.html">Cursos</a></li>
    <li><a href="certificate.html">Certificados</a></li>
  `;

  // Si el usuario está logueado
  if (usuario) {
    const nombreLi = document.createElement("li");
    nombreLi.innerHTML = `<span class="user-greeting">Hola, ${usuario.nombre}!</span>`;

    const logoutLi = document.createElement("li");
    logoutLi.innerHTML = `
      <button id="logout-icon" class="logout-icon" title="Cerrar sesión"></button>
    `;

    nav.appendChild(nombreLi);
    nav.appendChild(logoutLi);

    // Evento de cierre de sesión
    document
      .getElementById("logout-icon")
      .addEventListener("click", () => SessionManager.cerrarSesion());
  } else {
    // Usuario no logueado
    nav.innerHTML += `
      <li><a href="login.html">Iniciar sesión</a></li>
      <li><a href="register.html">Registrarse</a></li>
    `;
  }
}
