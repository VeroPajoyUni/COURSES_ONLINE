// ===============================
// MODAL PERSONALIZADO REUTILIZABLE
// ===============================
// Este módulo crea una ventana modal (popup) reutilizable para mostrar mensajes
// de información, error, advertencia o éxito, con título, mensaje y botón dinámico.

/**
 * Muestra un modal con contenido personalizado.
 * @param {Object} options - Parámetros del modal.
 * @param {string} options.titulo - Título del modal.
 * @param {string} options.mensaje - Texto del mensaje a mostrar.
 * @param {string} options.tipo - Tipo de mensaje (info, error, warning, success).
 * @param {string} options.boton - Texto del botón de cierre.
 */
export function mostrarModal({ titulo = "Mensaje", mensaje = "", tipo = "info", boton = "Aceptar" }) {
  // Si ya existe un modal abierto, eliminarlo antes de crear otro
  const modalExistente = document.querySelector('.custom-modal-overlay');
  if (modalExistente) modalExistente.remove();

  // Crear capa de fondo (overlay)
  const overlay = document.createElement('div');
  overlay.className = 'custom-modal-overlay';

  // Crear el contenedor del modal con clase según el tipo
  const modal = document.createElement('div');
  modal.className = `custom-modal ${tipo}`;

  // Título
  const header = document.createElement('h3');
  header.textContent = titulo;

  // Mensaje principal
  const body = document.createElement('p');
  body.textContent = mensaje;

  // Botón de cierre
  const button = document.createElement('button');
  button.textContent = boton;
  button.className = 'modal-btn';
  button.addEventListener('click', () => overlay.remove()); // Cierra modal

  // Estructura final del modal
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(button);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
