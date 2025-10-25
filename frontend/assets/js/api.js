const API_URL = "http://localhost:5000/api";

// ========================================
// CURSOS
// ========================================
export async function getCursos() {
  try {
    const respuesta = await fetch(`${API_URL}/cursos`);
    const data = await respuesta.json();
    console.log("Cursos obtenidos:", data);
    return data;
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return [];
  }
}

export async function getCursoDetalle(id_curso) {
  try {
    const respuesta = await fetch(`${API_URL}/cursos/${id_curso}`);
    const data = await respuesta.json();
    console.log("Detalle del curso obtenido:", data);
    return data;
  } catch (error) {
    console.error("Error al obtener detalle del curso:", error);
    return null;
  }
}

// ========================================
// AUTENTICACIÓN
// ========================================
export async function login(correo, contrasenia) {
  try {
    const respuesta = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, contrasenia }),
    });

    const data = await respuesta.json();
    
    if (data.exito) {
      // Guardar datos del usuario en sessionStorage
      sessionStorage.setItem("usuario", JSON.stringify(data.usuario));
      console.log("Login exitoso:", data.usuario);
    }
    
    return data;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return {
      exito: false,
      mensaje: "Error de conexión con el servidor",
    };
  }
}

export function logout() {
  sessionStorage.removeItem("usuario");
  window.location.href = "./login.html";
}

export function obtenerUsuarioActual() {
  const usuario = sessionStorage.getItem("usuario");
  return usuario ? JSON.parse(usuario) : null;
}

export function estaAutenticado() {
  return obtenerUsuarioActual() !== null;
}

// ========================================
// REGISTRO
// ========================================
export async function registrarUsuario(nombre, correo, contrasenia, id_rol, id_tipo_documento, numero_identificacion) {
  try {
    const respuesta = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, correo, contrasenia, id_rol, id_tipo_documento, numero_identificacion }),
    });

    const data = await respuesta.json();
    return data;
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return {
      exito: false,
      mensaje: "Error de conexión con el servidor",
    };
  }
}

export async function obtenerRoles() {
  try {
    const respuesta = await fetch(`${API_URL}/roles`);
    const data = await respuesta.json();
    return data;
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return [];
  }
}

export async function obtenerTiposDocumento() {
  try {
    const respuesta = await fetch(`${API_URL}/tipos-documento`);
    const data = await respuesta.json();
    return data;
  } catch (error) {
    console.error("Error al obtener tipos de documento:", error);
    return [];
  }
}