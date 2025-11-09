from .database import Database

class Calificacion:
    def __init__(self):
        self.db = Database()

    def obtener_por_usuario_evaluacion(self, id_usuario, id_evaluacion):
        consulta = """
            SELECT 
                id_calificacion,
                nota,
                id_usuario,
                id_evaluacion
            FROM calificaciones 
            WHERE id_usuario = %s AND id_evaluacion = %s
        """
        self.db.ejecutar(consulta, (id_usuario, id_evaluacion))
        return self.db.obtener_uno()

    def crear(self, datos):
        consulta = """
            INSERT INTO calificaciones (nota, id_usuario, id_evaluacion) 
            VALUES (%s, %s, %s)
        """
        valores = (
            datos["nota"],
            datos["id_usuario"],
            datos["id_evaluacion"],
        )
        self.db.ejecutar(consulta, valores)
        self.db.confirmar()
        return True
