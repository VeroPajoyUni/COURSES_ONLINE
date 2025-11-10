from .database import Database

class Progresos:
    def __init__(self):
        self.db = Database()

    def validar_leccion_completada(self, id_usuario, id_curso, id_leccion):
        consulta = """
            SELECT
                id_usuario,
                id_curso,
                id_leccion
            FROM progresos
            WHERE id_usuario = %s AND id_curso = %s AND id_leccion = %s;
        """
        self.db.ejecutar(consulta, (id_usuario, id_curso, id_leccion))
        return self.db.obtener_todos()
    
    def leccion_completada (self, id_usuario, id_curso, id_leccion):
        consulta = """
            INSERT INTO progresos (id_usuario, id_curso, id_leccion, leccion_completada)
            VALUES (%s, %s, %s, %s)
        """
        self.db.ejecutar(consulta, (id_usuario, id_curso, id_leccion, 1))
        return self.db.obtener_todos()
    
    def obtener_lecciones_completadas(self, id_usuario, id_curso):
        print("[Debug]: Obteniendo lecciones completadas para el usuario:", id_usuario, "en el curso:", id_curso)
        consulta = """
            SELECT
                id_leccion
            FROM progresos
            WHERE id_usuario = %s AND id_curso = %s AND leccion_completada = 1;
        """
        print("[Debug]: Bandera, antes de ejecutar la consulta.")
        self.db.ejecutar(consulta, (id_usuario, id_curso))
        print("[Debug]: Consulta ejecutada.")
        return self.db.obtener_todos()