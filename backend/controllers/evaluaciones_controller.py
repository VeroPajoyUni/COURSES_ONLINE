from models.evaluaciones import Evaluaciones
from utils.response import manejar_exito, manejar_error, manejar_accion_exitosa


class EvaluacionesController:
    def __init__(self):
        self.evaluacion = Evaluaciones()

    def listar_por_leccion(self, id_leccion):
        try:
            evaluaciones = self.evaluacion.obtener_por_leccion(id_leccion)
            mensaje = (
                "Evaluaciones encontradas correctamente"
                if evaluaciones
                else "No hay evaluaciones asociadas a esta lección"
            )
            return manejar_exito(evaluaciones, mensaje)
        except Exception as e:
            return manejar_error(e, "Error al listar las evaluaciones por lección")

    def obtener_detalle(self, id_evaluacion):
        try:
            detalle = self.evaluacion.obtener_detalle(id_evaluacion)
            if not detalle:
                return manejar_error(Exception("No encontrado"), "Evaluación no encontrada")
            return manejar_exito(detalle, "Detalle de la evaluación obtenido correctamente")
        except Exception as e:
            return manejar_error(e, "Error al obtener detalle de la evaluación")

    def crear_evaluacion(self, id_leccion, id_tipo):
        try:
            nuevo_id = self.evaluacion.crear(id_leccion, id_tipo)
            return manejar_exito(
                {"id_evaluacion": nuevo_id},
                "Evaluación creada correctamente"
            )
        except Exception as e:
            return manejar_error(e, "Error al crear la evaluación")
