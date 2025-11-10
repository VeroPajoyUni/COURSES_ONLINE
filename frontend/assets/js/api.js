// ==========================
// Archivo central de exportación de APIs
// ==========================

// Este archivo re-exporta todos los módulos de API del proyecto,
// permitiendo importar todas las funciones relacionadas con la API
// desde un único lugar. Por ejemplo, en un controlador se puede hacer:

export * from "../../assets/js/modules/apiAutenticacion.js";
export * from "../../assets/js/modules/apiRegistrarUsuario.js";
export * from "../../assets/js/modules/apiCursos.js";
export * from "../../assets/js/modules/apiLecciones.js";
export * from "../../assets/js/modules/apiEvaluaciones.js";
export * from "../../assets/js/modules/apiInscripciones.js";
export * from "../../assets/js/modules/apiProgreso.js";