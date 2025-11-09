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

            self.inscripciones.inscribir_usuario(id_usuario, id_curso)
            return manejar_accion_exitosa("Inscripción realizada correctamente")
        except Exception as e:
            return manejar_error(e, "Error al procesar la inscripción")

    def listar_por_usuario(self, id_usuario):
        try:
            datos = self.inscripciones.listar_por_usuario(id_usuario)
            mensaje = (
                f"Se encontraron {len(datos)} inscripciones"
                if datos
                else "El usuario no tiene inscripciones registradas"
            )
            return manejar_exito(datos, mensaje)
        except Exception as e:
            return manejar_error(e, "Error al listar las inscripciones del usuario")

    def actualizar_progreso(self, id_usuario, id_curso, id_leccion):
        try:
            print(f"[DeBug] Dentro de Actualizar Progreso.\nUsuario: {id_usuario}, Curso: {id_curso}, Lección: {id_leccion}")
            if not id_usuario or not id_curso or not id_leccion:
                return manejar_error(Exception("Datos incompletos"), "Faltan datos para actualizar el progreso")
            print("[DeBug] Datos completos verificados.")
            if not self.inscripciones.esta_inscrito(id_usuario, id_curso):
                return manejar_error(Exception("No inscrito"), "El usuario no está inscrito en este curso")
            print("[DeBug] Usuario inscrito verificado.")
            self.inscripciones.actualizar_progreso(id_usuario, id_curso, id_leccion)
            return manejar_accion_exitosa("Progreso actualizado correctamente")
        except Exception as e:
            return manejar_error(e, "Error al actualizar el progreso del curso")
