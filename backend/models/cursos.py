from .database import Database

class Curso:
    def __init__(self):
        self.db = Database()

    def obtener_todos(self):
        consulta = """
            SELECT 
                c.id_curso, c.titulo_curso, c.descripcion_curso, 
                u.nombre_usuario AS instructor
            FROM cursos c
            JOIN usuarios u ON c.id_usuario = u.id_usuario;
        """
        self.db.ejecutar(consulta)
        return self.db.obtener_todos()
