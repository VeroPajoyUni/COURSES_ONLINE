// ===============================
// MODAL PERSONALIZADO REUTILIZABLE
// ===============================
export function mostrarModal({
  titulo = "Mensaje",
  mensaje = "",
  tipo = "info",
  boton = "Aceptar",
  onClose = null,
}) {
  // Si ya existe un modal abierto, cerrarlo de forma segura
  cerrarModalAlerta();

  // Crear capa de fondo (overlay)
  const overlay = document.createElement("div");
  overlay.className = "custom-modal-overlay";
  overlay.style.zIndex = "9999"; // Garantiza que quede sobre otros modales

  // Crear contenedor principal
  const modal = document.createElement("div");
  modal.className = `custom-modal ${tipo}`;

  // Título
  const header = document.createElement("h3");
  header.textContent = titulo;

  // Mensaje
  const body = document.createElement("p");
  body.textContent = mensaje;

  // Botón
  const button = document.createElement("button");
  button.textContent = boton;
  button.className = "modal-btn";

  // Cierre del modal
  const cerrar = () => {
    modal.classList.add("closing");
    setTimeout(() => {
      overlay.remove();
      if (typeof onClose === "function") onClose(); // ejecuta callback tras cierre
    }, 200); // ligera transición
  };

  button.addEventListener("click", cerrar);
  overlay.addEventListener("click", (e) => {
    // permite cerrar si clickea fuera del modal
    if (e.target === overlay) cerrar();
  });

  // Armar estructura
  modal.append(header, body, button);
  overlay.append(modal);
  document.body.appendChild(overlay);
}

// ===============================
// FUNCIONES AUXILIARES
// ===============================
export function cerrarModalAlerta() {
  const overlay = document.querySelector(".custom-modal-overlay");
  if (overlay) overlay.remove();
}
