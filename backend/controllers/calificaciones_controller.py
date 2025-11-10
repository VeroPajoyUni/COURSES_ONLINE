from models.calificaciones import Calificacion
from utils.response import manejar_exito, manejar_error, manejar_accion_exitosa


class CalificacionesController:
    def __init__(self):
        self.calificacion = Calificacion()

    def guardar_calificacion(self, datos):
        try:
            nota = datos.get("nota")
            id_usuario = datos.get("id_usuario")
            id_evaluacion = datos.get("id_evaluacion")

            if not id_usuario or not id_evaluacion or nota is None:
                return manejar_error(Exception("Datos incompletos"), "Datos incompletos para guardar la calificación")

            existente = self.calificacion.obtener_por_usuario_evaluacion(id_usuario, id_evaluacion)
            if existente:
                self.calificacion.actualizar(nota, id_usuario, id_evaluacion)
            else:
                self.calificacion.crear(nota, id_usuario, id_evaluacion)

            return manejar_accion_exitosa("Calificación guardada correctamente")
        except Exception as e:
            return manejar_error(e, "Error al guardar la calificación")
