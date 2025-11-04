from models.cursos import Curso
from utils.response import manejar_exito, manejar_error, manejar_accion_exitosa

class CursosController:
    def __init__(self):
        self.curso = Curso()

    def listar_cursos(self):
        try:
            cursos = self.curso.obtener_todos()
            return manejar_exito(cursos, "Cursos obtenidos correctamente")
        except Exception as e:
            return manejar_error(e, "Error al listar los cursos")

    def obtener_detalle_curso(self, id_curso):
        try:
            curso = self.curso.obtener_por_id(id_curso)
            if not curso:
                return manejar_error(Exception("No encontrado"), "Curso no encontrado")

            lecciones = self.curso.obtener_lecciones(id_curso)
            total_estudiantes = self.curso.contar_estudiantes_inscritos(id_curso)

            curso["lecciones"] = lecciones
            curso["total_estudiantes"] = total_estudiantes
            curso["total_lecciones"] = len(lecciones)

            return manejar_exito(curso, "Detalle del curso obtenido correctamente")
        except Exception as e:
            return manejar_error(e, "Error al obtener detalle del curso")

    def crear_curso(self, datos):
        try:
            self.curso.crear(datos)
            return manejar_accion_exitosa("Curso creado exitosamente")
        except Exception as e:
            return manejar_error(e, "Error al crear el curso")

    def actualizar_curso(self, id_curso, datos):
        try:
            resultado = self.curso.actualizar(id_curso, datos)
            if resultado.get("sin_cambios"):
                return {"exito": True, "mensaje": "No se realizaron modificaciones"}
            return manejar_accion_exitosa("Curso actualizado correctamente")
        except Exception as e:
            return manejar_error(e, "Error al actualizar el curso")

    def eliminar_curso(self, id_curso):
        try:
            self.curso.eliminar(id_curso)
            return manejar_accion_exitosa("Curso eliminado correctamente")
        except Exception as e:
            return manejar_error(e, "Error al eliminar el curso")

    def listar_cursos_por_instructor(self, id_instructor):
        try:
            cursos = self.curso.obtener_por_instructor(id_instructor)
            mensaje = "Cursos del instructor obtenidos correctamente" if cursos else "No hay cursos registrados para este instructor"
            return manejar_exito(cursos, mensaje)
        except Exception as e:
            return manejar_error(e, "Error al listar los cursos del instructor")
