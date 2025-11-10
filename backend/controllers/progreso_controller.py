from models.progresos import Progresos
from utils.response import manejar_accion_exitosa, manejar_exito, manejar_error

class ProgresoController:
    def __init__(self):
        self.progreso = Progresos()
    
    def marcar_leccion_completada(self, id_usuario, id_curso, id_leccion):
        try:
            if self.progreso.validar_leccion_completada(id_usuario, id_curso, id_leccion):
                return manejar_accion_exitosa("La lección ya estaba marcada como completada.")
            
            self.progreso.leccion_completada(id_usuario, id_curso, id_leccion)
            return manejar_accion_exitosa("Lección marcada como completada correctamente.")
        except Exception as e:
            return manejar_error(e, "Error al marcar la lección como completada.")
    
    def obtener_lecciones_completadas(self, id_usuario, id_curso):
        try:
            print(f"[DeBug] Dentro de Obtener Lecciones Completadas.")
            lecciones_completadas = self.progreso.obtener_lecciones_completadas(id_usuario, id_curso)
            print(f"[DeBug] Lecciones completadas obtenidas: {lecciones_completadas}")
            return manejar_exito(lecciones_completadas)
        except Exception as e:
            return manejar_error(e, "Error al obtener las lecciones completadas.")