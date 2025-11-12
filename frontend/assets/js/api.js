// ==========================
// Archivo central de exportación de APIs
// ==========================

// Este archivo re-exporta todos los módulos de API del proyecto,
// permitiendo importar todas las funciones relacionadas con la API
// desde un único lugar. Por ejemplo, en un controlador se puede hacer:

export * from "./modules/apiAutenticacion.js"
export * from "./modules/apiRegistrarUsuario.js";
export * from "./modules/apiCursos.js";
export * from "./modules/apiLecciones.js";
export * from "./modules/apiEvaluaciones.js";
export * from "./modules/apiInscripciones.js";
export * from "./modules/apiProgreso.js";
