from .database import Database
from datetime import date

class Curso:
    def __init__(self):
        self.db = Database()

    # ====================================================
    #        OBTENER CURSOS
    # ====================================================
    def obtener_todos(self):
        consulta = """
            SELECT 
                c.id_curso, c.titulo_curso, c.descripcion_curso, 
                c.id_categoria, cat.nombre_categoria,
                u.id_usuario, u.nombre_usuario AS instructor,
                c.fecha_inicio, c.fecha_fin
            FROM cursos c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            JOIN categorias cat ON c.id_categoria = cat.id_categoria;
        """
        self.db.ejecutar(consulta)
        cursos = self.db.obtener_todos()

        # Calcular estado automáticamente
        hoy = date.today()
        for c in cursos:
            c["estado"] = "Activo" if c["fecha_fin"] >= hoy else "Inactivo"

        return cursos

    def obtener_por_instructor(self, id_instructor):
        consulta = """
            SELECT 
                c.id_curso, c.titulo_curso, c.descripcion_curso, 
                c.id_categoria, cat.nombre_categoria,
                u.id_usuario, u.nombre_usuario AS instructor,
                c.fecha_inicio, c.fecha_fin
            FROM cursos c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            JOIN categorias cat ON c.id_categoria = cat.id_categoria
            WHERE c.id_usuario = %s;
        """
        self.db.ejecutar(consulta, (id_instructor,))
        cursos = self.db.obtener_todos()

        hoy = date.today()
        for c in cursos:
            c["estado"] = "Activo" if c["fecha_fin"] >= hoy else "Inactivo"
        return cursos

    def obtener_por_id(self, id_curso):
        consulta = """
            SELECT 
                c.id_curso, c.titulo_curso, c.descripcion_curso, 
                c.fecha_inicio, c.fecha_fin,
                u.id_usuario, u.nombre_usuario AS instructor,
                cat.id_categoria, cat.nombre_categoria, cat.descripcion_categoria
            FROM cursos c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            JOIN categorias cat ON c.id_categoria = cat.id_categoria
            WHERE c.id_curso = %s
        """
        self.db.ejecutar(consulta, (id_curso,))
        curso = self.db.obtener_uno()
        if not curso:
            return None

        hoy = date.today()
        curso["estado"] = "Activo" if curso["fecha_fin"] >= hoy else "Inactivo"
        return curso

    def obtener_lecciones(self, id_curso):
        consulta = """
            SELECT id_leccion, titulo_leccion, descripcion_leccion
            FROM lecciones
            WHERE id_curso = %s
            ORDER BY id_leccion ASC
        """
        self.db.ejecutar(consulta, (id_curso,))
        return self.db.obtener_todos()

    def contar_estudiantes_inscritos(self, id_curso):
        consulta = "SELECT COUNT(*) AS total FROM inscripciones WHERE id_curso = %s"
        self.db.ejecutar(consulta, (id_curso,))
        resultado = self.db.obtener_uno()
        return resultado["total"] if resultado else 0

    # ====================================================
    #                 MÉTODOS CRUD
    # ====================================================
    def crear(self, datos):
        consulta = """
            INSERT INTO cursos (titulo_curso, descripcion_curso, fecha_inicio, fecha_fin, id_usuario, id_categoria)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        valores = (
            datos["titulo_curso"],
            datos["descripcion_curso"],
            datos["fecha_inicio"],
            datos["fecha_fin"],
            datos["id_usuario"],
            datos["id_categoria"],
        )
        self.db.ejecutar(consulta, valores)
        self.db.confirmar()
        return True

    def actualizar(self, id_curso, datos):
        actual = self.obtener_por_id(id_curso)
        if not actual:
            raise Exception("Curso no encontrado")

        sin_cambios = (
            actual["titulo_curso"] == datos["titulo_curso"]
            and actual["descripcion_curso"] == datos["descripcion_curso"]
            and actual["fecha_inicio"].isoformat() == datos["fecha_inicio"]
            and actual["fecha_fin"].isoformat() == datos["fecha_fin"]
            and actual["id_categoria"] == datos["id_categoria"]
        )

        if sin_cambios:
            return {"sin_cambios": True}

        consulta = """
            UPDATE cursos
            SET titulo_curso = %s,
                descripcion_curso = %s,
                fecha_inicio = %s,
                fecha_fin = %s,
                id_categoria = %s
            WHERE id_curso = %s
        """
        valores = (
            datos["titulo_curso"],
            datos["descripcion_curso"],
            datos["fecha_inicio"],
            datos["fecha_fin"],
            datos["id_categoria"],
            id_curso,
        )
        self.db.ejecutar(consulta, valores)
        self.db.confirmar()
        return {"sin_cambios": False}

    def eliminar(self, id_curso):
        inscritos = self.contar_estudiantes_inscritos(id_curso)
        if inscritos > 0:
            raise Exception("No se puede eliminar el curso porque tiene usuarios inscritos.")

        self.db.ejecutar("DELETE FROM cursos WHERE id_curso = %s", (id_curso,))
        self.db.confirmar()
        return True
