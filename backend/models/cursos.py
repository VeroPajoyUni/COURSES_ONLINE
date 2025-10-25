from .database import Database

class Curso:
    def __init__(self):
        self.db = Database()

    def obtener_todos(self):
        consulta = """
            SELECT 
                c.id_curso, c.titulo_curso, c.descripcion_curso, 
                u.nombre_usuario AS instructor,
                cat.nombre_categoria,
                c.fecha_inicio,
                c.fecha_fin
            FROM cursos c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            JOIN categorias cat ON c.id_categoria = cat.id_categoria;
        """
        self.db.ejecutar(consulta)
        return self.db.obtener_todos()

    def obtener_por_id(self, id_curso):
        """
        Obtiene los detalles completos de un curso por su ID.
        """
        consulta = """
            SELECT 
                c.id_curso, 
                c.titulo_curso, 
                c.descripcion_curso, 
                c.fecha_inicio,
                c.fecha_fin,
                u.id_usuario,
                u.nombre_usuario AS instructor,
                cat.id_categoria,
                cat.nombre_categoria,
                cat.descripcion_categoria
            FROM cursos c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            JOIN categorias cat ON c.id_categoria = cat.id_categoria
            WHERE c.id_curso = %s
        """
        self.db.ejecutar(consulta, (id_curso,))
        return self.db.obtener_uno()

    def obtener_lecciones(self, id_curso):
        """
        Obtiene todas las lecciones de un curso específico.
        """
        consulta = """
            SELECT 
                id_leccion,
                titulo_leccion,
                descripcion_leccion
            FROM lecciones
            WHERE id_curso = %s
            ORDER BY id_leccion ASC
        """
        self.db.ejecutar(consulta, (id_curso,))
        return self.db.obtener_todos()

    def contar_estudiantes_inscritos(self, id_curso):
        """
        Cuenta cuántos estudiantes están inscritos en un curso.
        """
        consulta = """
            SELECT COUNT(*) as total
            FROM inscripciones
            WHERE id_curso = %s
        """
        self.db.ejecutar(consulta, (id_curso,))
        resultado = self.db.obtener_uno()
        return resultado['total'] if resultado else 0