// ===============================
// MODAL PERSONALIZADO REUTILIZABLE
// ===============================
export function mostrarModal({ titulo = "Mensaje", mensaje = "", tipo = "info", boton = "Aceptar" }) {
  // Si ya existe un modal abierto, eliminarlo primero
  const modalExistente = document.querySelector('.custom-modal-overlay');
  if (modalExistente) modalExistente.remove();

  // Crear elementos base
  const overlay = document.createElement('div');
  overlay.className = 'custom-modal-overlay';

  const modal = document.createElement('div');
  modal.className = `custom-modal ${tipo}`;

  const header = document.createElement('h3');
  header.textContent = titulo;

  const body = document.createElement('p');
  body.textContent = mensaje;

  const button = document.createElement('button');
  button.textContent = boton;
  button.className = 'modal-btn';

  // Cerrar modal al hacer clic en el botón
  button.addEventListener('click', () => overlay.remove());

  // Estructura del modal
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(button);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
