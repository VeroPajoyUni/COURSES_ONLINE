from models.inscripciones import Inscripciones

class InscripcionesController:
    def __init__(self):
        self.inscripciones = Inscripciones()

    def inscribir(self, id_usuario, id_curso):
        if not id_usuario or not id_curso:
            return {"exito": False, "mensaje": "Datos incompletos"}

        # Verificar si ya está inscrito
        if self.inscripciones.esta_inscrito(id_usuario, id_curso):
            return {"exito": False, "mensaje": "Ya estás inscrito en este curso"}

        # Verificar si el curso ya finalizó
        if self.inscripciones.curso_finalizado(id_curso):
            return {"exito": False, "mensaje": "El curso ya ha finalizado"}

        # Intentar inscripción
        if self.inscripciones.inscribir_usuario(id_usuario, id_curso):
            return {"exito": True, "mensaje": "Inscripción exitosa"}
        else:
            return {"exito": False, "mensaje": "Error al inscribirse en el curso"}
