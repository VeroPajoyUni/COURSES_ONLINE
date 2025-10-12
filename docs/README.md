# 🎓 COURSESONLINE

**COURSESONLINE** es una plataforma educativa desarrollada **sin frameworks**, utilizando **HTML, CSS, JavaScript puro y Python**, bajo el patrón de arquitectura **MVC (Modelo–Vista–Controlador)**.  
Su objetivo principal es **evaluar la calidad del software**, garantizando modularidad, mantenibilidad y trazabilidad entre componentes.

El sistema implementa las siguientes **historias de usuario principales**:
- **HU04:** Previsualizar curso.  
- **HU06:** Realizar curso.  
- **HU08:** Generar certificado.  

## Estructura del Proyecto

## 🖥️ FRONTEND

El **frontend** gestiona la interfaz visual del sistema, permitiendo la interacción del usuario mediante vistas HTML, estilos CSS y lógica JavaScript.

<details>
<summary><b>assets/</b></summary>

Contiene todos los **recursos estáticos** del proyecto.

- **img/** → logos, íconos, banners.  
- **js/** → scripts principales del sitio:  
  - `main.js` → inicializa la aplicación.  
  - `api.js` → simula peticiones al backend.  
  - **utils/** → funciones reutilizables (validaciones, formatos).  
  - **modules/** → módulos específicos:  
    - `coursePreview.js` → Previsualizar curso (HU04).  
    - `coursePlayer.js` → Realizar curso (HU06).  
    - `certificateGenerator.js` → Generar certificado (HU08).
</details>

<details>
<summary><b>styles/</b></summary>

Define la presentación visual del proyecto.

- **css/** → estilos principales:  
  - `main.css` → diseño base global.  
  - `course.css` → vista de cursos.  
  - `certificate.css` → vista del certificado.  
- **components/** → estilos de componentes reutilizables:  
  - `header.css`, `footer.css`, `card-course.css`.
</details>

<details>
<summary><b>views/</b></summary>

Contiene las **páginas HTML** que verá el usuario:
- `index.html` → página principal y buscador de cursos.  
- `coursePreview.html` → detalles del curso (HU04).  
- `coursePlayer.html` → ejecución de lecciones (HU06).  
- `certificate.html` → certificado emitido (HU08).
</details>

<details>
<summary><b>controllers/</b></summary>

Controlan la interacción entre las vistas y los modelos del frontend.

- `mainController.js` → navegación general.  
- `cursosController.js` → carga y filtrado de cursos.  
- `leccionesController.js` → gestión del progreso del usuario.  
- `evaluacionesController.js` → quizzes y evaluaciones finales.  
- `certificadosController.js` → descarga o visualización del certificado.
</details>

<details>
<summary><b>models/</b></summary>

Define las estructuras de datos equivalentes a las tablas del modelo SQL.

- `usuariosModel.js`  
- `cursosModel.js`  
- `leccionesModel.js`  
- `evaluacionesModel.js`  
- `inscripcionesModel.js`  
- `certificadosModel.js`
</details>

## ⚙️ BACKEND

El **backend** implementa la lógica de negocio, conexión con la base de datos `cursos_online` y generación de certificados PDF, todo en **Python puro**.

<details>
<summary><b>app.py</b></summary>

Archivo principal del servidor.  
Define rutas, inicializa los controladores y coordina la comunicación con el frontend.
</details>

<details>
<summary><b>models/</b></summary>

Cada archivo representa una **tabla de la base de datos** y gestiona sus operaciones CRUD.

Ejemplos:
- `usuarios.py` → usuarios y roles.  
- `cursos.py` → cursos y categorías.  
- `lecciones.py` → contenido de cursos.  
- `evaluaciones.py`, `preguntas.py`, `respuestas.py` → gestión de quizzes.  
- `inscripciones.py` → progreso de estudiantes.  
- `certificados.py` → emisión de certificados.
</details>

<details>
<summary><b>controllers/</b></summary>

Implementan la lógica de negocio y coordinan la interacción entre los modelos y las vistas.

- `usuarios_controller.py`  
- `cursos_controller.py`  
- `lecciones_controller.py`  
- `evaluaciones_controller.py`  
- `inscripciones_controller.py`  
- `certificados_controller.py`
</details>

<details>
<summary><b>views/</b></summary>

Define las respuestas enviadas al frontend.  

- **templates/** → vistas HTML dinámicas (si se usa Jinja).  
- **responses/** → archivos JSON simulando API (para pruebas locales).
</details>

<details>
<summary><b>utils/</b></summary>

Contiene herramientas auxiliares reutilizables:

- `validators.py` → validaciones de datos.  
- `file_generator.py` → genera certificados PDF.  
- `helpers.py` → funciones generales de apoyo.
</details>

<details>
<summary><b>tests/</b></summary>

Pruebas unitarias e integrales para medir la **calidad del software**:

- `test_usuarios.py`  
- `test_cursos.py`  
- `test_lecciones.py`  
- `test_evaluaciones.py`  
- `test_certificados.py`
</details>

## 📚 DOCUMENTACIÓN

<details>
<summary><b>docs/</b></summary>

Contiene la documentación técnica y de calidad del proyecto.

- `modelo_entidad_relacion.png` → MER del sistema.  
- `diagrama_funcional.png` → flujo general de actores.  
- `historias_usuario.pdf` → detalle de las HU04, HU06 y HU08.  
- **calidad_software/** → reportes de evaluación:
  - `métricas_calidad.md`  
  - `criterios_usabilidad.md`  
  - `validacion_funcional.md`
</details>

#### `.gitignore`

Archivo que indica los elementos **no versionables** (archivos temporales, entornos virtuales, cachés, etc.).

## Objetivos del Proyecto

- Diseñar una estructura limpia y escalable sin depender de frameworks.  
- Aplicar el patrón MVC tanto en frontend como en backend.  
- Implementar funcionalmente las historias HU04, HU06 y HU08.  
- Evaluar la calidad mediante pruebas, validaciones y documentación técnica.  

✨ **Autores:** 
- *Yisel Verónica Pajoy Maca*
- *Adiel Felipe Espinosa Muñoz*
- *Yeison Alexis Añasco Benavides*

*Proyecto académico — Plataforma de Cursos Online*
