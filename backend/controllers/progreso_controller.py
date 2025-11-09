from models.inscripciones import Inscripciones
from models.evaluaciones import Evaluaciones
from utils.response import manejar_exito, manejar_error


class ProgresoController:
    def __init__(self):
        self.inscripcion = Inscripciones()
        self.evaluacion = Evaluaciones()

    def marcar_leccion_completada(self, id_usuario, id_curso, id_leccion):
        try:
            inscripcion = self.inscripcion.obtener_por_usuario_y_curso(id_usuario, id_curso)
            if not inscripcion:
                return manejar_error(Exception("No inscrito"), "El usuario no está inscrito en este curso")

            total_lecciones = self.inscripcion.contar_lecciones_por_curso(id_curso)
            if total_lecciones == 0:
                return manejar_error(Exception("Sin lecciones"), "El curso no tiene lecciones registradas")

            id_eval = self.evaluacion.obtener_o_crear_por_leccion(id_leccion, id_tipo=1)
            self.inscripcion.registrar_calificacion_si_no_existe(id_usuario, id_eval)

            progreso_actualizado = self.inscripcion.calcular_progreso(id_usuario, id_curso, total_lecciones)
            self.inscripcion.actualizar_progreso(id_usuario, id_curso, progreso_actualizado)

            return manejar_exito(
                {"progreso": progreso_actualizado},
                "Lección completada y progreso actualizado correctamente"
            )
        except Exception as e:
            return manejar_error(e, "Error al marcar la lección como completada")
