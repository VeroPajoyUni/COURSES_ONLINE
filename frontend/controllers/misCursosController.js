import { obtenerInscripcionesUsuario, getCursoDetalle } from "../assets/js/api.js";
import { SessionManager } from "../controllers/utils/sessionManager.js";
import { mostrarModal } from "../controllers/utils/modalAlertsController.js";

/**
 * Controlador principal encargado de mostrar los cursos en los que el usuario está inscrito.
 * - Valida la sesión del usuario.
 * - Obtiene sus inscripciones desde la API.
 * - Consulta los detalles de cada curso inscrito.
 * - Renderiza las tarjetas dinámicamente en el frontend.
 */
export async function mostrarMisCursos() {
  const usuario = SessionManager.obtenerUsuario(); // 🔹 Obtener el usuario logueado
  const contenedor = document.getElementById("mis-cursos-container");

  // ⚠️ Validación: si no hay sesión activa, mostrar alerta
  if (!usuario || !usuario.id_usuario) {
    console.warn("Usuario no logueado.");
    mostrarModal({
      titulo: "Inicia sesión",
      mensaje: "Debes iniciar sesión para ver tus cursos.",
      tipo: "warning",
      boton: "Aceptar"
    });
    return [];
  }

  try {
    // 🔹 1. Obtener inscripciones del usuario desde la API
    const response = await obtenerInscripcionesUsuario(usuario.id_usuario);
    console.log("Inscripciones del usuario:", response);

    // ⚠️ Validación: si no hay cursos inscritos
    if (!response || !response.exito || !Array.isArray(response.data) || response.data.length === 0) {
      console.info("No hay cursos inscritos para este usuario.");
      mostrarModal({
        titulo: "¡Ups! 🫡",
        mensaje: "Aún no estás inscrito a ningún curso.",
        tipo: "info",
        boton: "Explorar cursos"
      });

      // Redirigir al index si el usuario pulsa el botón
      const modalBtn = document.querySelector(".modal-btn");
      if (modalBtn) modalBtn.addEventListener("click", () => window.location.href = "./index.html");
      return [];
    }

    // 🔹 2. Extraer IDs de los cursos inscritos
    const misCursos = response.data.map(ins => ins.id_curso);
    console.log("IDs de cursos inscritos:", misCursos);

    // Guardar en sesión por conveniencia
    SessionManager.guardarDatos("misCursos", misCursos);

    // 🔹 3. Obtener detalle de cada curso (en paralelo)
    const cursosConDetalle = (await Promise.all(
      misCursos.map(async idCurso => {
        const curso = await getCursoDetalle(idCurso);
        if (!curso || !curso.exito || !curso.data) {
          console.warn(`Curso con ID ${idCurso} no encontrado o inválido.`);
          return null;
        }
        return curso.data; // ✅ accedemos a la propiedad data donde viene la info real
      })
    )).filter(curso => curso !== null);

    console.log("Detalle de cursos obtenidos:", cursosConDetalle);

    // 🔹 4. Renderizar las tarjetas de cursos
    contenedor.innerHTML = cursosConDetalle.map(detalle => {
      const fechaFin = new Date(detalle.fecha_fin);
      const hoy = new Date();
      const finalizado = hoy > fechaFin;

      return `
        <div class="card">
          <h3>${detalle.titulo_curso || "Sin título"}</h3>
          <p>${detalle.descripcion_curso || "Sin descripción disponible"}</p>
          <small>${detalle.nombre_categoria || "Categoría desconocida"}</small>
          <div class="card-footer">
            ${
              finalizado
                ? `<button class="btn-certificado" title="Descargar certificado">📄</button>`
                : `<a href="./cursoDetalle.html?id=${detalle.id_curso}" class="btn-continuar">Continuar el curso</a>`
            }
          </div>
        </div>
      `;
    }).join("");

    // 🔹 5. Agregar botón "Explorar más cursos"
    const btnExplorar = document.createElement("button");
    btnExplorar.className = "btn-all explorar-mas";
    btnExplorar.textContent = cursosConDetalle.length > 0 ? "Explorar más cursos" : "Explorar cursos";
    btnExplorar.addEventListener("click", () => window.location.href = "./index.html");
    contenedor.appendChild(btnExplorar);

    // 🔹 6. Asignar evento a los botones de certificado
    document.querySelectorAll(".btn-certificado").forEach(btn => {
      btn.addEventListener("click", () => {
        mostrarModal({
          titulo: "Certificado",
          mensaje: "Funcionalidad de descarga aún no implementada.",
          tipo: "info",
          boton: "Aceptar"
        });
      });
    });

    return cursosConDetalle;

  } catch (error) {
    // ⚠️ Captura de errores generales
    console.error("Error al cargar mis cursos:", error);
    mostrarModal({
      titulo: "Error",
      mensaje: "Ocurrió un error al cargar tus cursos.",
      tipo: "error",
      boton: "Aceptar"
    });
    return [];
  }
}
