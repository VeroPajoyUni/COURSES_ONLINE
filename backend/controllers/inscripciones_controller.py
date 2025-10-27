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
            return {"exito": True, "mensaje": "Inscripción exitosa"}
        else:
            return {"exito": False, "mensaje": "Error al inscribirse en el curso"}

    def listar_por_usuario(self, id_usuario):
        """Obtiene todas las inscripciones de un usuario."""
        print(f"Obteniendo inscripciones del usuario {id_usuario}...")
        try:
            datos = self.inscripciones.listar_por_usuario(id_usuario)
            if datos:
                print(f"Se encontraron {len(datos)} inscripciones para el usuario {id_usuario}.")
                return {"exito": True, "data": datos}
            else:
                print(f"El usuario {id_usuario} no tiene inscripciones registradas.")
                return {"exito": True, "data": [], "mensaje": "El usuario no tiene inscripciones"}
        except Exception as e:
            print(f"Error al listar inscripciones del usuario {id_usuario}: {e}")
            return {"exito": False, "mensaje": "Error al obtener las inscripciones del usuario"}
