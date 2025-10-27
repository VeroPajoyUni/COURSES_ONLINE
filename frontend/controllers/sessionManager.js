export const SessionManager = {
  // Guarda los datos del usuario en la sesión
  guardarUsuario(usuario) {
    sessionStorage.setItem("usuarioLogueado", "true");
    sessionStorage.setItem("id_usuario", usuario.id_usuario);
    sessionStorage.setItem("usuarioNombre", usuario.nombre);
    sessionStorage.setItem("usuarioRol", usuario.rol);
  },

  // Obtiene el usuario actual
  obtenerUsuario() {
    const logueado = sessionStorage.getItem("usuarioLogueado") === "true";
    if (!logueado) return null;

    return {
      id_usuario: parseInt(sessionStorage.getItem("id_usuario")),
      nombre: sessionStorage.getItem("usuarioNombre"),
      rol: sessionStorage.getItem("usuarioRol"),
    };
  },

  // Verifica si hay sesión activa
  estaLogueado() {
    return sessionStorage.getItem("usuarioLogueado") === "true";
  },

  // Limpia la sesión y redirige al login
  cerrarSesion() {
    sessionStorage.clear();
    window.location.href = "./login.html";
  },

  // 🔹 Métodos genéricos para otros datos de sesión (como "misCursos")
  guardarDatos(clave, valor) {
    sessionStorage.setItem(clave, JSON.stringify(valor));
  },

  obtenerDatos(clave) {
    const data = sessionStorage.getItem(clave);
    return data ? JSON.parse(data) : null;
  }
};
