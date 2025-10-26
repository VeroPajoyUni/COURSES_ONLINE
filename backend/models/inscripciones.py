from .database import Database
from datetime import date

class Inscripciones:
    def __init__(self):
        self.db = Database()

    def obtener_id_estado(self, nombre_estado):
        consulta = "SELECT id_estado FROM estados WHERE nombre_estado = %s"
        self.db.ejecutar(consulta, (nombre_estado,))
        resultado = self.db.obtener_uno()
        return resultado["id_estado"] if resultado else None

    def esta_inscrito(self, id_usuario, id_curso):
        consulta = """
            SELECT * FROM inscripciones
            WHERE id_usuario = %s AND id_curso = %s
        """
        self.db.ejecutar(consulta, (id_usuario, id_curso))
        return self.db.obtener_uno() is not None

    def curso_finalizado(self, id_curso):
        consulta = "SELECT fecha_fin FROM cursos WHERE id_curso = %s"
        self.db.ejecutar(consulta, (id_curso,))
        curso = self.db.obtener_uno()
        if not curso:
            return True
        fecha_fin = curso["fecha_fin"]
        return date.today() > fecha_fin

    def inscribir_usuario(self, id_usuario, id_curso):
        id_estado_inscrito = self.obtener_id_estado("Inscrito")
        if not id_estado_inscrito:
            print("⚠️ Error: No existe el estado 'Inscrito' en la tabla estados.")
            return False

        consulta = """
            INSERT INTO inscripciones (fecha_inscripcion, progreso, id_usuario, id_curso, id_estado)
            VALUES (CURDATE(), 0, %s, %s, %s)
        """
        try:
            self.db.ejecutar(consulta, (id_usuario, id_curso, id_estado_inscrito))
            return True
        except Exception as e:
            print(f"Error al inscribir usuario: {e}")
            return False
