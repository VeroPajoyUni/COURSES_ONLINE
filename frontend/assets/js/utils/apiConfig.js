// ==========================
// Configuración base de la API
// ==========================
// URL base de la API para usar en todas las peticiones fetch
export const API_URL = "http://localhost:5000/api";

/**
 * Función base para realizar peticiones HTTP usando fetch
 * @param {string} url - URL de la API a la que se hará la petición
 * @param {object} options - Opciones de fetch (method, headers, body, etc.)
 * @returns {object} - Retorna la respuesta del servidor como objeto JSON, o un objeto { exito: false, data: null, mensaje } en caso de error
 */
export async function fetchData(url, options = {}) {
  try {
    console.log("[DeBug] Bandera: Dentro de fetchData.")
    const respuesta = await fetch(url, options); // realiza la petición
    console.log("[DeBug] Respuesta recibida de la API.", respuesta)
    const data = await respuesta.json();         // convierte la respuesta a JSON
    return data;                                  // retorna los datos obtenidos
  } catch (error) {
    console.error("Error en la petición:", error);
    // Retorna un objeto estandarizado indicando error de conexión
    return {
      exito: false,
      data: null,
      mensaje: "Error de conexión con el servidor"
    };
  }
}

/**
 * Helper que llama a fetchData y normaliza la respuesta
 * Esto asegura que todas las APIs devuelvan siempre un objeto con:
 * { exito: boolean, data: cualquier, mensaje: string }
 * 
 * @param {string} url - URL de la API
 * @param {object} options - Opciones de fetch
 * @returns {object} - Objeto normalizado con { exito, data, mensaje }
 */
export async function fetchJSON(url, options = {}) {
  console.log("[DeBug] Bandera: Dentro de fetchJSON.", url, options)
  console.log("[DeBug] Llamado a fetchData.");
  const data = await fetchData(url, options);
  console.log("[DeBug] Respuesta recibida de fetchData.", data)

  try {
    // Si la respuesta ya tiene exito y data, se retorna tal cual
    if (data && typeof data === "object" && "exito" in data && "data" in data) {
      return data;
    }

    // Si la respuesta es un array, asumimos éxito y lo encapsulamos en data
    if (Array.isArray(data)) {
      return { exito: true, data };
    }

    // Si la respuesta es un objeto sin exito, asumimos éxito y lo colocamos en data
    if (data && typeof data === "object") {
      return { exito: true, data };
    }

    // En cualquier otro caso, respuesta inválida
    return { exito: false, data: null, mensaje: "Respuesta inválida del servidor" };
  } catch (e) {
    console.error("Error normalizando respuesta:", e);
    return { exito: false, data: null, mensaje: "Error procesando la respuesta" };
  }
}
