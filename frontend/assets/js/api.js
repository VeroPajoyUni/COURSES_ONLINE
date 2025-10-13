export async function getCursos() {
  try {
    const respuesta = await fetch("http://localhost:5000/api/cursos");
    const data = await respuesta.json();
    console.log("Cursos obtenidos:", data);
    return data;
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return [];
  }
}
