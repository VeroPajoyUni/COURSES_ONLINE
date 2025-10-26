import { getCursoDetalle, inscribirCurso, obtenerInscripcionesUsuario } from "../assets/js/api.js";
import { mostrarModal } from "../controllers/modalAlertsController.js";

async function cargarDetalleCurso() {
  const urlParams = new URLSearchParams(window.location.search);
  const idCurso = urlParams.get("id");

  const loading = document.getElementById("loading");
  const error = document.getElementById("error");
  const contenedor = document.getElementById("cursoDetalle");

  // Validar ID de curso
  if (!idCurso) {
    loading.style.display = "none";
    error.style.display = "block";
    error.textContent = "No se encontró el curso solicitado.";
    return;
  }

  try {
    const curso = await getCursoDetalle(idCurso);
    loading.style.display = "none";

    if (!curso) {
      error.style.display = "block";
      error.textContent = "No se pudo cargar el curso.";
      return;
    }

    // Renderizar detalle del curso
    contenedor.style.display = "block";
    contenedor.innerHTML = `
      <div class="curso-header">
        <div class="breadcrumb">
          <a href="./index.html">Cursos</a> / ${curso.titulo_curso}
        </div>
        <h1>${curso.titulo_curso}</h1>
        <p class="categoria-tag">${curso.nombre_categoria}</p>
        <p class="descripcion">${curso.descripcion_curso}</p>
      </div>

      <div class="curso-info-grid">
        <div class="info-card">
          <h3>👨‍🏫 Instructor</h3>
          <p>${curso.instructor}</p>
        </div>
        <div class="info-card">
          <h3>📅 Duración</h3>
          <p>${formatearFecha(curso.fecha_inicio)} - ${formatearFecha(curso.fecha_fin)}</p>
        </div>
        <div class="info-card">
          <h3>👥 Estudiantes</h3>
          <p>${curso.total_estudiantes} inscritos</p>
        </div>
        <div class="info-card">
          <h3>📚 Lecciones</h3>
          <p>${curso.total_lecciones} lecciones</p>
        </div>
      </div>

      <div class="curso-contenido">
        <div class="lecciones-section">
          <h2>Contenido del curso</h2>
          ${
            curso.lecciones.length > 0
              ? `
            <div class="lecciones-lista">
              ${curso.lecciones
                .map(
                  (leccion, index) => `
                <div class="leccion-item">
                  <div class="leccion-numero">${index + 1}</div>
                  <div class="leccion-info">
                    <h4>${leccion.titulo_leccion}</h4>
                    <p>${leccion.descripcion_leccion}</p>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : `
            <p class="sin-lecciones">Este curso aún no tiene lecciones disponibles.</p>
          `
          }
        </div>

        <div class="acciones-section">
          <button class="btn-inscribirse">Inscribirme al curso</button>
          <button class="btn-compartir">Compartir curso</button>
          <a href="./index.html" class="btn-volver-cursos">Volver a cursos</a>
        </div>
      </div>

      <div class="categoria-info">
        <h3>Sobre la categoría: ${curso.nombre_categoria}</h3>
        <p>${curso.descripcion_categoria}</p>
      </div>
    `;

    // ==========================
    // BOTÓN INSCRIBIRSE
    // ==========================
    const btnInscribirse = document.querySelector(".btn-inscribirse");
    const fechaActual = new Date();
    const fechaFinCurso = new Date(curso.fecha_fin);

    btnInscribirse.addEventListener("click", async () => {
      const usuario = JSON.parse(localStorage.getItem("usuario"));

      // Validar login
      if (!usuario) {
        mostrarModal({
          titulo: "Inicia sesión para continuar",
          mensaje: "Debes iniciar sesión para inscribirte en este curso.",
          tipo: "warning",
          boton: "Entendido"
        });
        return;
      }

      // Validar fecha
      if (fechaActual > fechaFinCurso) {
        mostrarModal({
          titulo: "Curso finalizado",
          mensaje: "Este curso ya ha finalizado. No es posible inscribirse.",
          tipo: "error",
          boton: "Cerrar"
        });
        return;
      }

      // Verificar si ya está inscrito
      const inscripciones = await obtenerInscripcionesUsuario(usuario.id_usuario);
      const yaInscrito = inscripciones.some(ins => ins.id_curso === parseInt(idCurso));

      if (yaInscrito) {
        mostrarModal({
          titulo: "Ya inscrito",
          mensaje: "Ya estás inscrito en este curso.",
          tipo: "warning",
          boton: "Aceptar"
        });
        return;
      }

      // Confirmar inscripción
      mostrarModal({
        titulo: "Confirmar inscripción",
        mensaje: "¿Deseas inscribirte en este curso?",
        tipo: "info",
        boton: "Confirmar"
      });

      // Esperar confirmación del modal
      const modalBtn = document.querySelector(".modal-btn");
      modalBtn.addEventListener(
        "click",
        async () => {
          const resultado = await inscribirCurso(usuario.id_usuario, idCurso);

          if (resultado.exito) {
            mostrarModal({
              titulo: "🎉 Inscripción exitosa",
              mensaje: `¡Felicidades! Te has inscrito correctamente en <b>${curso.titulo_curso}</b>.`,
              tipo: "success",
              boton: "Continuar"
            });

            btnInscribirse.textContent = "Inscrito";
            btnInscribirse.disabled = true;
            btnInscribirse.classList.add("inscrito");

            agregarCursoAMisCursos(idCurso);
          } else {
            mostrarModal({
              titulo: "Error en la inscripción",
              mensaje: "No se pudo completar la inscripción. Intenta nuevamente.",
              tipo: "error",
              boton: "Cerrar"
            });
          }
        },
        { once: true }
      );
    });

    // ==========================
    // BOTÓN COMPARTIR
    // ==========================
    document.querySelector(".btn-compartir").addEventListener("click", () => {
      if (navigator.share) {
        navigator.share({
          title: curso.titulo_curso,
          text: curso.descripcion_curso,
          url: window.location.href
        });
      } else {
        mostrarModal({
          titulo: "Compartir no disponible",
          mensaje: "Tu navegador no admite la función de compartir.",
          tipo: "info",
          boton: "Cerrar"
        });
      }
    });
  } catch (errorEx) {
    console.error("Error al cargar el curso:", errorEx);
    loading.style.display = "none";
    error.style.display = "block";
    error.textContent = "Ocurrió un error al cargar los datos del curso.";
  }
}

// ==========================
// FUNCIONES AUXILIARES
// ==========================
function formatearFecha(fecha) {
  const date = new Date(fecha);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("es-ES", options);
}

function agregarCursoAMisCursos(idCurso) {
  let misCursos = JSON.parse(localStorage.getItem("misCursos")) || [];
  if (!misCursos.includes(idCurso)) {
    misCursos.push(idCurso);
    localStorage.setItem("misCursos", JSON.stringify(misCursos));
  }
}

// ==========================
// INICIALIZACIÓN
// ==========================
window.addEventListener("DOMContentLoaded", cargarDetalleCurso);
