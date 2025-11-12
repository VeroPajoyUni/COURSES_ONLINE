"""
Controlador de Cursos (cursos_controller.py)
--------------------------------------------
Este módulo define la clase `CursosController`, encargada de manejar toda la
lógica de negocio relacionada con los cursos dentro de la aplicación.

Funciones principales:
- Listar cursos disponibles.
- Obtener detalles completos de un curso.
- Crear, actualizar y eliminar cursos.
- Consultar los cursos asociados a un instructor específico.

El controlador se comunica directamente con el modelo `Curso`, que gestiona
las operaciones con la base de datos, y utiliza las funciones de `utils.response`
para generar respuestas estandarizadas.
"""

from models.cursos import Curso
from utils.response import manejar_exito, manejar_error, manejar_accion_exitosa


class CursosController:
    """
    Clase controladora de cursos.
    Contiene los métodos para gestionar el ciclo de vida de los cursos,
    desde su creación hasta su eliminación.
    """

    def __init__(self):
        """
        Inicializa el controlador y crea una instancia del modelo `Curso`.
        """
        self.curso = Curso()

    # ============================================================
    # MÉTODO: LISTAR CURSOS
    # ============================================================
    def listar_cursos(self):
        """
        Obtiene la lista completa de cursos registrados en el sistema.

        Returns:
            dict: Respuesta estructurada con el listado de cursos o error.
        """
        try:
            cursos = self.curso.obtener_todos()
            return manejar_exito(cursos, "Cursos obtenidos correctamente")
        except Exception as e:
            return manejar_error(e, "Error al listar los cursos")

    # ============================================================
    # MÉTODO: OBTENER DETALLE DE CURSO
    # ============================================================
    def obtener_detalle_curso(self, id_curso):
        """
        Retorna la información completa de un curso específico, incluyendo:
        - Datos generales del curso.
        - Lista de lecciones asociadas.
        - Cantidad total de estudiantes inscritos.

        Args:
            id_curso (int): Identificador del curso a consultar.

        Returns:
            dict: Información del curso con sus detalles, o un mensaje de error.
        """
        try:
            curso = self.curso.obtener_por_id(id_curso)
            if not curso:
                return manejar_error(Exception("No encontrado"), "Curso no encontrado")

            # Obtener lecciones y cantidad de estudiantes
            lecciones = self.curso.obtener_lecciones(id_curso)
            total_estudiantes = self.curso.contar_estudiantes_inscritos(id_curso)

            # Enriquecer los datos del curso
            curso["lecciones"] = lecciones
            curso["total_estudiantes"] = total_estudiantes
            curso["total_lecciones"] = len(lecciones)

            return manejar_exito(curso, "Detalle del curso obtenido correctamente")
        except Exception as e:
            return manejar_error(e, "Error al obtener detalle del curso")

    # ============================================================
    # MÉTODO: CREAR CURSO
    # ============================================================
    def crear_curso(self, datos):
        """
        Registra un nuevo curso en la base de datos.

        Args:
            datos (dict): Información del curso (título, descripción, fechas, etc.)

        Returns:
            dict: Mensaje de éxito o error según el resultado.
        """
        try:
            self.curso.crear(datos)
            return manejar_accion_exitosa("Curso creado exitosamente")
        except Exception as e:
            return manejar_error(e, "Error al crear el curso")

    # ============================================================
    # MÉTODO: ACTUALIZAR CURSO
    # ============================================================
    def actualizar_curso(self, id_curso, datos):
        """
        Actualiza la información de un curso existente.

        Args:
            id_curso (int): ID del curso a actualizar.
            datos (dict): Campos y valores a modificar.

        Returns:
            dict: Resultado de la operación (éxito o error).
        """
        try:
            resultado = self.curso.actualizar(id_curso, datos)
            if resultado.get("sin_cambios"):
                return {"exito": True, "mensaje": "No se realizaron modificaciones"}
            return manejar_accion_exitosa("Curso actualizado correctamente")
        except Exception as e:
            return manejar_error(e, "Error al actualizar el curso")

    # ============================================================
    # MÉTODO: ELIMINAR CURSO
    # ============================================================
    def eliminar_curso(self, id_curso):
        """
        Elimina un curso del sistema de forma permanente.

        Args:
            id_curso (int): Identificador del curso a eliminar.

        Returns:
            dict: Mensaje de éxito o error del proceso.
        """
        try:
            self.curso.eliminar(id_curso)
            return manejar_accion_exitosa("Curso eliminado correctamente")
        except Exception as e:
            return manejar_error(e, "Error al eliminar el curso")

    # ============================================================
    # MÉTODO: LISTAR CURSOS POR INSTRUCTOR
    # ============================================================
    def listar_cursos_por_instructor(self, id_instructor):
        """
        Obtiene todos los cursos creados por un instructor específico.

        Args:
            id_instructor (int): Identificador del instructor.

        Returns:
            dict: Lista de cursos asociados al instructor o mensaje de error.
        """
        try:
            cursos = self.curso.obtener_por_instructor(id_instructor)
            mensaje = (
                "Cursos del instructor obtenidos correctamente"
                if cursos else
                "No hay cursos registrados para este instructor"
            )
            return manejar_exito(cursos, mensaje)
        except Exception as e:
            return manejar_error(e, "Error al listar los cursos del instructor")
