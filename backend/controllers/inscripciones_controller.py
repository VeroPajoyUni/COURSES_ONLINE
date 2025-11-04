from models.inscripciones import Inscripciones
from utils.response import manejar_exito, manejar_error, manejar_accion_exitosa


class InscripcionesController:
    def __init__(self):
        self.inscripciones = Inscripciones()

    def inscribir(self, id_usuario, id_curso):
        """Gestiona la lógica para inscribir un usuario en un curso."""
        try:
            if not id_usuario or not id_curso:
                return manejar_error(Exception("Datos incompletos"), "Datos incompletos para la inscripción")

            if self.inscripciones.esta_inscrito(id_usuario, id_curso):
                return manejar_error(Exception("Duplicado"), "Ya estás inscrito en este curso")

            if self.inscripciones.curso_finalizado(id_curso):
                return manejar_error(Exception("Curso finalizado"), "El curso ya ha finalizado")

            exito = self.inscripciones.inscribir_usuario(id_usuario, id_curso)
            if exito:
                return manejar_accion_exitosa("Inscripción exitosa")
            else:
                return manejar_error(Exception("Fallo en BD"), "Error al inscribirse en el curso")

        except Exception as e:
            return manejar_error(e, "Error al procesar la inscripción")

    def listar_por_usuario(self, id_usuario):
        """Obtiene todas las inscripciones de un usuario."""
        try:
            datos = self.inscripciones.listar_por_usuario(id_usuario)
            mensaje = (
                f"Se encontraron {len(datos)} inscripciones" if datos else "El usuario no tiene inscripciones"
            )
            return manejar_exito(datos, mensaje)
        except Exception as e:
            return manejar_error(e, "Error al obtener las inscripciones del usuario")
