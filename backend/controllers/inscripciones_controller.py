from models.inscripciones import Inscripciones

class InscripcionesController:
    def __init__(self):
        self.inscripciones = Inscripciones()

    def inscribir(self, id_usuario, id_curso):
        """Gestiona la lógica para inscribir un usuario en un curso."""
        print(f"Intentando inscribir usuario {id_usuario} al curso {id_curso}...")

        if not id_usuario or not id_curso:
            return {"exito": False, "mensaje": "Datos incompletos para la inscripción"}

        # Verificar si ya está inscrito
        if self.inscripciones.esta_inscrito(id_usuario, id_curso):
            print("El usuario ya está inscrito.")
            return {"exito": False, "mensaje": "Ya estás inscrito en este curso"}

        # Verificar si el curso ya finalizó
        if self.inscripciones.curso_finalizado(id_curso):
            print("El curso ya ha finalizado.")
            return {"exito": False, "mensaje": "El curso ya ha finalizado"}

        # Intentar inscripción
        exito = self.inscripciones.inscribir_usuario(id_usuario, id_curso)
        if exito:
            print("Inscripción realizada con éxito.")
            return {"exito": True, "mensaje": "Inscripción exitosa"}
        else:
            print("Error durante el proceso de inscripción.")
            return {"exito": False, "mensaje": "Error al inscribirse en el curso"}
