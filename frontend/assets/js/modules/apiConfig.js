// Configuración base de la API
export const API_URL = "http://localhost:5000/api";

// Función auxiliar para peticiones genéricas
export async function fetchData(url, options = {}) {
  try {
    const respuesta = await fetch(url, options);
    const data = await respuesta.json();
    return data;
  } catch (error) {
    console.error("Error en la petición:", error);
    return {
      exito: false,
      mensaje: "Error de conexión con el servidor"
    };
  }
}
