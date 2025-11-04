from .database import Database
from datetime import date


class Leccion:
    def __init__(self):
        self.db = Database()

    # ====================================================
    #                 OBTENER LECCIONES
    # ====================================================
    def obtener_por_curso(self, id_curso):
        consulta = """
            SELECT 
                l.id_leccion,
                l.titulo_leccion,
                l.descripcion_leccion,
                l.id_curso,
                c.titulo_curso
            FROM lecciones l
            JOIN cursos c ON l.id_curso = c.id_curso
            WHERE l.id_curso = %s
            ORDER BY l.id_leccion ASC
        """
        self.db.ejecutar(consulta, (id_curso,))
        return self.db.obtener_todos()

    def obtener_por_id(self, id_leccion):
        consulta = """
            SELECT 
                id_leccion,
                titulo_leccion,
                descripcion_leccion,
                id_curso
            FROM lecciones
            WHERE id_leccion = %s
        """
        self.db.ejecutar(consulta, (id_leccion,))
        return self.db.obtener_uno()

    # ====================================================
    #                 CRUD LECCIONES
    # ====================================================
    def crear(self, datos):
        consulta = """
            INSERT INTO lecciones (titulo_leccion, descripcion_leccion, id_curso)
            VALUES (%s, %s, %s)
        """
        valores = (
            datos["titulo_leccion"],
            datos["descripcion_leccion"],
            datos["id_curso"],
        )
        self.db.ejecutar(consulta, valores)
        self.db.confirmar()
        return True

    def actualizar(self, id_leccion, datos):
        actual = self.obtener_por_id(id_leccion)
        if not actual:
            raise Exception("Lección no encontrada")

        sin_cambios = (
            actual["titulo_leccion"] == datos["titulo_leccion"]
            and actual["descripcion_leccion"] == datos["descripcion_leccion"]
        )

        if sin_cambios:
            return {"sin_cambios": True}

        consulta = """
            UPDATE lecciones
            SET titulo_leccion = %s,
                descripcion_leccion = %s
            WHERE id_leccion = %s
        """
        valores = (
            datos["titulo_leccion"],
            datos["descripcion_leccion"],
            id_leccion,
        )
        self.db.ejecutar(consulta, valores)
        self.db.confirmar()
        return {"sin_cambios": False}

    def eliminar(self, id_leccion):
        # Eliminar evaluaciones y preguntas asociadas (en cascada manual)
        self.db.ejecutar("DELETE FROM respuestas WHERE id_pregunta IN (SELECT id_preguntas FROM preguntas WHERE id_evaluacion IN (SELECT id_evaluacion FROM evaluaciones WHERE id_leccion = %s))", (id_leccion,))
        self.db.ejecutar("DELETE FROM preguntas WHERE id_evaluacion IN (SELECT id_evaluacion FROM evaluaciones WHERE id_leccion = %s)", (id_leccion,))
        self.db.ejecutar("DELETE FROM evaluaciones WHERE id_leccion = %s", (id_leccion,))
        self.db.ejecutar("DELETE FROM lecciones WHERE id_leccion = %s", (id_leccion,))
        self.db.confirmar()
        return True
