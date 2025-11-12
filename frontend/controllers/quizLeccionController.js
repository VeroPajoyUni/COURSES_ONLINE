// ===========================
// Controlador del Quiz de Lección
// ===========================
// Maneja la lógica del modal de quiz con 5 preguntas de verdadero/falso

// Estado del quiz
let preguntas = [];
let preguntaActual = 0;
let respuestasUsuario = [];

// Flags para evitar listeners duplicados
let listenersInicializados = false;
let navegacionConfigurada = false;

// Referencias a handlers para poder removerlos
let escKeyHandler = null;
let modalClickHandler = null;
let btnAnteriorHandler = null;
let btnSiguienteHandler = null;
let btnFinalizarHandler = null;
let btnPresentarQuizHandler = null;

// ===========================
// Obtener referencias al DOM
// ===========================
function getElements() {
  return {
    btnPresentarQuiz: document.getElementById("btn-presentar-quiz"),
    quizModal: document.getElementById("quiz-modal"),
    btnCerrarModal: document.getElementById("btn-cerrar-modal"),
    preguntaContainer: document.getElementById("pregunta-container"),
    btnAnterior: document.getElementById("btn-anterior"),
    btnSiguiente: document.getElementById("btn-siguiente"),
    btnFinalizar: document.getElementById("btn-finalizar"),
    btnCerrar: document.getElementById("btn-cerrar"),
    progressFill: document.getElementById("progress-fill"),
    progressText: document.getElementById("progress-text"),
    resultadoDiv: document.getElementById("resultado"),
    quizFooter: document.querySelector(".quiz-footer")
  };
}

// ===========================
// Inicializar el quiz con datos de ejemplo
// ===========================
function inicializarQuiz(datosPreguntas = null) {
  // Si se proporcionan datos, usarlos; si no, usar datos de ejemplo
  if (datosPreguntas && Array.isArray(datosPreguntas) && datosPreguntas.length > 0) {
    // Convertir las preguntas del backend al formato del quiz
    preguntas = datosPreguntas.slice(0, 5).map((p, index) => {
      // Buscar la respuesta correcta
      const respuestaCorrecta = p.respuestas?.find(
        (r) => r.es_correcta === "1" || r.es_correcta === 1 || r.es_correcta === true
      );
      
      // Convertir a verdadero/falso basado en la respuesta correcta
      // Si la respuesta correcta contiene "verdadero", "true", "sí", etc.
      const textoCorrecto = respuestaCorrecta?.opciones?.toLowerCase() || "";
      const esVerdadero = 
        textoCorrecto.includes("verdadero") || 
        textoCorrecto.includes("true") || 
        textoCorrecto.includes("sí") ||
        textoCorrecto.includes("si") ||
        textoCorrecto.includes("correcto");

      return {
        id: p.id_preguntas || index + 1,
        pregunta: p.pregunta,
        respuestaCorrecta: esVerdadero ? "verdadero" : "falso"
      };
    });
  } else {
    // Datos de ejemplo para demostración
    preguntas = [
      {
        id: 1,
        pregunta: "JavaScript es un lenguaje de programación orientado a objetos.",
        respuestaCorrecta: "verdadero"
      },
      {
        id: 2,
        pregunta: "HTML es un lenguaje de programación.",
        respuestaCorrecta: "falso"
      },
      {
        id: 3,
        pregunta: "CSS se usa para dar estilo a las páginas web.",
        respuestaCorrecta: "verdadero"
      },
      {
        id: 4,
        pregunta: "Python es más rápido que JavaScript en todos los casos.",
        respuestaCorrecta: "falso"
      },
      {
        id: 5,
        pregunta: "Las bases de datos relacionales usan SQL para consultas.",
        respuestaCorrecta: "verdadero"
      }
    ];
  }

  // Inicializar respuestas del usuario
  respuestasUsuario = new Array(preguntas.length).fill(null);
  preguntaActual = 0;
  
  // Mostrar primera pregunta
  mostrarPregunta();
  actualizarProgreso();
}

// ===========================
// Mostrar pregunta actual
// ===========================
function mostrarPregunta() {
  if (preguntaActual < 0 || preguntaActual >= preguntas.length) return;

  const { preguntaContainer } = getElements();
  if (!preguntaContainer) return;

  const pregunta = preguntas[preguntaActual];
  const respuestaSeleccionada = respuestasUsuario[preguntaActual];

  preguntaContainer.innerHTML = `
    <div class="quiz-pregunta">
      <span class="quiz-pregunta-numero">Pregunta ${preguntaActual + 1}</span>
      <h3 class="quiz-pregunta-texto">${pregunta.pregunta}</h3>
      <div class="quiz-opciones-verdadero-falso">
        <label class="quiz-opcion-vf ${respuestaSeleccionada === "verdadero" ? "seleccionada" : ""}">
          <input 
            type="radio" 
            name="respuesta" 
            value="verdadero" 
            ${respuestaSeleccionada === "verdadero" ? "checked" : ""}
          />
          <span class="opcion-icon">✓</span>
          <span class="opcion-texto">Verdadero</span>
        </label>
        <label class="quiz-opcion-vf ${respuestaSeleccionada === "falso" ? "seleccionada" : ""}">
          <input 
            type="radio" 
            name="respuesta" 
            value="falso" 
            ${respuestaSeleccionada === "falso" ? "checked" : ""}
          />
          <span class="opcion-icon">✗</span>
          <span class="opcion-texto">Falso</span>
        </label>
      </div>
    </div>
  `;

  // Agregar eventos a los radio buttons
  const radios = preguntaContainer.querySelectorAll('input[type="radio"]');
  radios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      respuestasUsuario[preguntaActual] = e.target.value;
      actualizarEstadoBotones();
    });
  });

  actualizarEstadoBotones();
}

// ===========================
// Actualizar estado de los botones
// ===========================
function actualizarEstadoBotones() {
  const { btnAnterior, btnSiguiente, btnFinalizar } = getElements();
  if (!btnAnterior || !btnSiguiente || !btnFinalizar) return;

  // Botón anterior
  btnAnterior.disabled = preguntaActual === 0;

  // Botón siguiente/finalizar
  const tieneRespuesta = respuestasUsuario[preguntaActual] !== null;
  
  if (preguntaActual === preguntas.length - 1) {
    // Última pregunta
    btnSiguiente.style.display = "none";
    btnFinalizar.style.display = "flex";
    btnFinalizar.disabled = !tieneRespuesta;
  } else {
    // No es la última pregunta
    btnSiguiente.style.display = "flex";
    btnFinalizar.style.display = "none";
    btnSiguiente.disabled = !tieneRespuesta;
  }
}

// ===========================
// Actualizar barra de progreso
// ===========================
function actualizarProgreso() {
  const { progressFill, progressText } = getElements();
  if (!progressFill || !progressText) return;

  const porcentaje = ((preguntaActual + 1) / preguntas.length) * 100;
  progressFill.style.width = `${porcentaje}%`;
  progressText.textContent = `Pregunta ${preguntaActual + 1} de ${preguntas.length}`;
}

// ===========================
// Configurar eventos de navegación
// ===========================
function configurarNavegacion() {
  // Evitar configurar múltiples veces
  if (navegacionConfigurada) return;

  const { btnAnterior, btnSiguiente, btnFinalizar } = getElements();
  
  // Remover listeners anteriores si existen
  if (btnAnterior && btnAnteriorHandler) {
    btnAnterior.removeEventListener("click", btnAnteriorHandler);
  }
  if (btnSiguiente && btnSiguienteHandler) {
    btnSiguiente.removeEventListener("click", btnSiguienteHandler);
  }
  if (btnFinalizar && btnFinalizarHandler) {
    btnFinalizar.removeEventListener("click", btnFinalizarHandler);
  }

  // Crear nuevos handlers
  btnAnteriorHandler = () => {
    if (preguntaActual > 0) {
      preguntaActual--;
      mostrarPregunta();
      actualizarProgreso();
    }
  };

  btnSiguienteHandler = () => {
    if (respuestasUsuario[preguntaActual] === null) {
      alert("Por favor selecciona una respuesta antes de continuar.");
      return;
    }

    if (preguntaActual < preguntas.length - 1) {
      preguntaActual++;
      mostrarPregunta();
      actualizarProgreso();
    }
  };

  btnFinalizarHandler = async () => {
    if (respuestasUsuario[preguntaActual] === null) {
      alert("Por favor selecciona una respuesta antes de finalizar.");
      return;
    }

    // Verificar si todas las preguntas tienen respuesta
    const todasRespondidas = respuestasUsuario.every(r => r !== null);
    if (!todasRespondidas) {
      alert("Por favor responde todas las preguntas antes de finalizar.");
      return;
    }

    await evaluarQuiz();
  };

  // Agregar listeners
  if (btnAnterior) {
    btnAnterior.addEventListener("click", btnAnteriorHandler);
  }

  if (btnSiguiente) {
    btnSiguiente.addEventListener("click", btnSiguienteHandler);
  }

  if (btnFinalizar) {
    btnFinalizar.addEventListener("click", btnFinalizarHandler);
  }

  navegacionConfigurada = true;
}

// ===========================
// Evaluar respuestas del quiz
// ===========================
async function evaluarQuiz() {
  let correctas = 0;
  const resultados = [];

  preguntas.forEach((pregunta, index) => {
    const respuestaUsuario = respuestasUsuario[index];
    const esCorrecta = respuestaUsuario === pregunta.respuestaCorrecta;
    
    if (esCorrecta) {
      correctas++;
    }

    resultados.push({
      pregunta: pregunta.pregunta,
      respuestaUsuario,
      respuestaCorrecta: pregunta.respuestaCorrecta,
      esCorrecta
    });
  });

  const { preguntaContainer, btnAnterior, btnSiguiente, btnFinalizar } = getElements();
  
  // Ocultar preguntas y botones de navegación
  if (preguntaContainer) preguntaContainer.style.display = "none";
  if (btnAnterior) btnAnterior.style.display = "none";
  if (btnSiguiente) btnSiguiente.style.display = "none";
  if (btnFinalizar) btnFinalizar.style.display = "none";

  // Guardar calificación en el servidor
  if (evaluacionActual && idUsuarioActual) {
    const res = await guardarCalificacionQuiz(correctas, preguntas.length);
    if (res && res.exito) {
      console.log("Calificación guardada exitosamente:", res);
    } else if (res) {
      console.error("Error al guardar calificación:", res.mensaje);
    }
  }

  // Llamar al callback si existe
  if (callbackCompletado && typeof callbackCompletado === "function") {
    callbackCompletado();
  }

  // Mostrar resultados
  mostrarResultados(correctas, resultados);
}

// ===========================
// Mostrar resultados del quiz
// ===========================
function mostrarResultados(correctas, resultados) {
  const todasCorrectas = correctas === preguntas.length;
  const porcentaje = (correctas / preguntas.length) * 100;

  let htmlResultado = "";

  if (todasCorrectas) {
    // ¡Aprobó todas!
    htmlResultado = `
      <div class="quiz-resultado exito">
        <div class="quiz-resultado-titulo">
          <span>🎉 ¡Felicidades!</span>
        </div>
        <div class="quiz-resultado-puntaje">${correctas}/${preguntas.length}</div>
        <div class="quiz-resultado-mensaje">
          <p><strong>¡Aprobaste el quiz!</strong></p>
          <p>Respondiste correctamente todas las ${preguntas.length} preguntas.</p>
          <p class="mensaje-felicidades">¡Excelente trabajo! 🎊</p>
        </div>
      </div>
    `;
  } else {
    // Mostrar errores
    const preguntasIncorrectas = resultados.filter(r => !r.esCorrecta);
    
    htmlResultado = `
      <div class="quiz-resultado error">
        <div class="quiz-resultado-titulo">
          <span>📝 Resultados del Quiz</span>
        </div>
        <div class="quiz-resultado-puntaje">${correctas}/${preguntas.length}</div>
        <div class="quiz-resultado-mensaje">
          <p>Respondiste correctamente <strong>${correctas} de ${preguntas.length}</strong> preguntas.</p>
          <p class="porcentaje-resultado">Porcentaje: <strong>${porcentaje.toFixed(0)}%</strong></p>
        </div>
        <div class="preguntas-incorrectas">
          <h4>❌ Preguntas en las que fallaste:</h4>
          <ul class="lista-errores">
            ${preguntasIncorrectas.map((resultado, index) => `
              <li class="error-item">
                <div class="error-pregunta">
                  <strong>${resultados.findIndex(r => r === resultado) + 1}. ${resultado.pregunta}</strong>
                </div>
                <div class="error-detalle">
                  <span class="tu-respuesta">Tu respuesta: <strong>${resultado.respuestaUsuario === "verdadero" ? "Verdadero" : "Falso"}</strong></span>
                  <span class="respuesta-correcta">Respuesta correcta: <strong>${resultado.respuestaCorrecta === "verdadero" ? "Verdadero" : "Falso"}</strong></span>
                </div>
              </li>
            `).join("")}
          </ul>
        </div>
      </div>
    `;
  }

  const { resultadoDiv, quizFooter } = getElements();
  
  if (resultadoDiv) {
    resultadoDiv.innerHTML = htmlResultado;
    resultadoDiv.style.display = "block";
  }
  if (quizFooter) quizFooter.style.display = "flex";
}

// ===========================
// Abrir modal del quiz
// ===========================
function abrirModal() {
  const { quizModal } = getElements();
  if (!quizModal) return;

  quizModal.classList.add("active");
  document.body.style.overflow = "hidden";
  inicializarQuiz();
  // Solo configurar navegación si no está configurada
  if (!navegacionConfigurada) {
    configurarNavegacion();
  }
}

// ===========================
// Cerrar modal del quiz
// ===========================
function cerrarModal() {
  const { quizModal, preguntaContainer, resultadoDiv, quizFooter, btnAnterior, btnSiguiente, btnFinalizar } = getElements();
  
  if (quizModal) {
    quizModal.classList.remove("active");
  }
  document.body.style.overflow = "";
  
  // Resetear estado
  preguntaActual = 0;
  respuestasUsuario = [];
  if (preguntaContainer) preguntaContainer.style.display = "block";
  if (resultadoDiv) resultadoDiv.style.display = "none";
  if (quizFooter) quizFooter.style.display = "none";
  if (btnAnterior) btnAnterior.style.display = "flex";
  if (btnSiguiente) btnSiguiente.style.display = "flex";
  if (btnFinalizar) btnFinalizar.style.display = "none";
}

// ===========================
// Inicializar Event Listeners
// ===========================
function inicializarEventListeners() {
  // Evitar inicializar múltiples veces
  if (listenersInicializados) return;

  const { btnPresentarQuiz, btnCerrarModal, btnCerrar, quizModal } = getElements();

  // Remover listeners anteriores si existen
  if (escKeyHandler) {
    document.removeEventListener("keydown", escKeyHandler);
  }
  if (quizModal && modalClickHandler) {
    quizModal.removeEventListener("click", modalClickHandler);
  }

  // Crear handlers
  modalClickHandler = (e) => {
    if (e.target === quizModal) {
      cerrarModal();
    }
  };

  escKeyHandler = (e) => {
    const { quizModal: modal } = getElements();
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      cerrarModal();
    }
  };

  // Agregar listeners solo si los elementos existen
  if (btnPresentarQuiz) {
    // Remover listener anterior si existe
    if (btnPresentarQuizHandler) {
      btnPresentarQuiz.removeEventListener("click", btnPresentarQuizHandler);
    }
    // Crear y guardar handler
    btnPresentarQuizHandler = abrirModal;
    btnPresentarQuiz.addEventListener("click", btnPresentarQuizHandler);
  }

  if (btnCerrarModal) {
    btnCerrarModal.addEventListener("click", cerrarModal);
  }

  if (btnCerrar) {
    btnCerrar.addEventListener("click", cerrarModal);
  }

  if (quizModal) {
    quizModal.addEventListener("click", modalClickHandler);
  }

  // Cerrar con tecla ESC (solo una vez en el documento)
  document.addEventListener("keydown", escKeyHandler);

  listenersInicializados = true;
}

// ===========================
// Event Listeners (inicialización inmediata si los elementos existen)
// ===========================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarEventListeners);
} else {
  // DOM ya está cargado
  inicializarEventListeners();
}

// Intentar inicializar después de un delay solo si aún no se inicializó
// (útil cuando el HTML se carga dinámicamente)
setTimeout(() => {
  if (!listenersInicializados) {
    inicializarEventListeners();
  }
}, 100);

// ===========================
// Exportar funciones para uso externo
// ===========================
let evaluacionActual = null;
let idUsuarioActual = null;
let callbackCompletado = null;

export async function iniciarQuiz(datosPreguntas, evaluacion = null, idUsuario = null, onCompletado = null) {
  evaluacionActual = evaluacion;
  idUsuarioActual = idUsuario;
  callbackCompletado = onCompletado;
  
  // Resetear flag de navegación para permitir reconfiguración si es necesario
  navegacionConfigurada = false;
  
  inicializarQuiz(datosPreguntas);
  abrirModal();
}

// ===========================
// Guardar calificación en el servidor
// ===========================
async function guardarCalificacionQuiz(correctas, total) {
  if (!evaluacionActual || !idUsuarioActual) {
    return null;
  }

  const porcentaje = (correctas / total) * 100;
  
  try {
    const { guardarCalificacion } = await import("../assets/js/api.js");
    const payload = {
      id_usuario: idUsuarioActual,
      id_evaluacion: evaluacionActual.id_evaluacion,
      calificacion: porcentaje,
    };

    const res = await guardarCalificacion(payload);
    return res;
  } catch (error) {
    console.error("Error guardando calificación:", error);
    return { exito: false, mensaje: "Error al guardar la calificación" };
  }
}


