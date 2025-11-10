// ===============================
// GESTOR DE SESIÓN DEL USUARIO
// ===============================
// Este módulo centraliza la gestión del estado de sesión del usuario.
// Permite guardar, recuperar y eliminar datos de sesión usando `sessionStorage`.
// Además, incluye métodos auxiliares para almacenar datos adicionales.

export const SessionManager = {
  /**
   * Guarda los datos del usuario logueado en la sesión.
   * @param {Object} usuario - Datos del usuario retornados por el backend.
   */
  guardarUsuario(usuario) {
    sessionStorage.setItem("usuarioLogueado", "true");
    sessionStorage.setItem("id_usuario", usuario.id_usuario);
    sessionStorage.setItem("usuarioNombre", usuario.nombre_usuario);
    sessionStorage.setItem("usuarioRol", usuario.nombre_rol);
    sessionStorage.setItem("usuario", JSON.stringify(usuario)); // Guardado completo
  },

  /**
   * Obtiene los datos del usuario actual desde la sesión.
   * @returns {Object|null} Usuario o null si no hay sesión activa.
   */
  obtenerUsuario() {
    const logueado = sessionStorage.getItem("usuarioLogueado") === "true";
    if (!logueado) return null;

    return {
      id_usuario: parseInt(sessionStorage.getItem("id_usuario")),
      nombre: sessionStorage.getItem("usuarioNombre"),
      rol: sessionStorage.getItem("usuarioRol"),
    };
  },

  /**
   * Verifica si hay una sesión activa.
   * @returns {boolean} True si el usuario está logueado, false si no.
   */
  estaLogueado() {
    return sessionStorage.getItem("usuarioLogueado") === "true";
  },

  /**
   * Cierra la sesión eliminando los datos y redirigiendo al login.
   */
  cerrarSesion() {
    sessionStorage.clear();
    window.location.href = "./login.html";
  },

  /**
   * Guarda datos genéricos adicionales en la sesión.
   * Por ejemplo: `SessionManager.guardarDatos("misCursos", arrayDeCursos)`
   * @param {string} clave - Nombre del dato.
   * @param {*} valor - Valor a guardar.
   */
  guardarDatos(clave, valor) {
    sessionStorage.setItem(clave, JSON.stringify(valor));
  },

  /**
   * Recupera datos genéricos guardados en sesión.
   * @param {string} clave - Nombre del dato.
   * @returns {*} El valor almacenado o null si no existe.
   */
  obtenerDatos(clave) {
    const data = sessionStorage.getItem(clave);
    return data ? JSON.parse(data) : null;
  }
};
