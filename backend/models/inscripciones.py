from .database import Database
from datetime import date

class Inscripciones:
    def __init__(self):
        self.db = Database()

    def obtener_id_estado(self, nombre_estado):
        """Obtiene el ID de un estado según su nombre."""
        consulta = "SELECT id_estado FROM estados WHERE nombre_estado = %s"
        self.db.ejecutar(consulta, (nombre_estado,))
        resultado = self.db.obtener_uno()
        return resultado["id_estado"] if resultado else None

    def esta_inscrito(self, id_usuario, id_curso):
        """Verifica si el usuario ya está inscrito en un curso."""
        consulta = """
            SELECT * FROM inscripciones
            WHERE id_usuario = %s AND id_curso = %s
        """
        self.db.ejecutar(consulta, (id_usuario, id_curso))
        return self.db.obtener_uno() is not None

    def curso_finalizado(self, id_curso):
        """Verifica si el curso ya finalizó según la fecha_fin."""
        consulta = "SELECT fecha_fin FROM cursos WHERE id_curso = %s"
        self.db.ejecutar(consulta, (id_curso,))
        curso = self.db.obtener_uno()
        if not curso:
            return True  # Si el curso no existe, se asume finalizado
        fecha_fin = curso["fecha_fin"]
        return date.today() > fecha_fin

    def inscribir_usuario(self, id_usuario, id_curso):
        """Inserta una nueva inscripción si todo está correcto."""
        id_estado_inscrito = self.obtener_id_estado("Inscrito")
        if not id_estado_inscrito:
            print("Error: No existe el estado 'Inscrito' en la tabla estados.")
            return {"exito": False, "mensaje": "Estado 'Inscrito' no encontrado"}

        consulta = """
            INSERT INTO inscripciones (fecha_inscripcion, progreso, id_usuario, id_curso, id_estado)
            VALUES (CURDATE(), 0, %s, %s, %s)
        """
        try:
            self.db.ejecutar(consulta, (id_usuario, id_curso, id_estado_inscrito))
            self.db.confirmar()
            return {"exito": True, "mensaje": "Inscripción exitosa"}
        except Exception as e:
            print(f"Error al inscribir usuario: {e}")
            return {"exito": False, "mensaje": f"Error al inscribirse: {e}"}

    def listar_por_usuario(self, id_usuario):
        """Devuelve todas las inscripciones asociadas a un usuario."""
        consulta = """
            SELECT i.id_inscripcion, i.id_curso, c.titulo_curso, i.fecha_inscripcion, e.nombre_estado
            FROM inscripciones i
            JOIN cursos c ON i.id_curso = c.id_curso
            JOIN estados e ON i.id_estado = e.id_estado
            WHERE i.id_usuario = %s
        """
        self.db.ejecutar(consulta, (id_usuario,))
        return self.db.obtener_todos()
