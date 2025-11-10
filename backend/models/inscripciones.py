from .database import Database
from datetime import date

class Inscripciones:
    def __init__(self):
        self.db = Database()

    # ====================================================
    #                   MÉTODOS AUXILIARES
    # ====================================================
    def obtener_id_estado(self, nombre_estado):
        consulta = "SELECT id_estado FROM estados WHERE nombre_estado = %s"
        self.db.ejecutar(consulta, (nombre_estado,))
        resultado = self.db.obtener_uno()
        return resultado["id_estado"] if resultado else None

    """Verifica si el curso ya finalizó según la fecha_fin."""
    def curso_finalizado(self, id_curso):
        consulta = "SELECT fecha_fin FROM cursos WHERE id_curso = %s"
        self.db.ejecutar(consulta, (id_curso,))
        curso = self.db.obtener_uno()
        if not curso:
            return True # Si el curso no existe, se asume finalizado
        return date.today() > curso["fecha_fin"]

    def contar_lecciones_por_curso(self, id_curso):
        consulta = "SELECT COUNT(*) AS total FROM lecciones WHERE id_curso = %s"
        self.db.ejecutar(consulta, (id_curso,))
        resultado = self.db.obtener_uno()
        return resultado["total"] if resultado else 0

    # ====================================================
    #               GESTIÓN DE INSCRIPCIONES
    # ====================================================
    def esta_inscrito(self, id_usuario, id_curso):
        consulta = """
            SELECT 
                fecha_inscripcion,
                progreso,
                id_usuario,
                id_curso,
                id_estado 
            FROM inscripciones
            WHERE id_usuario = %s AND id_curso = %s
        """
        self.db.ejecutar(consulta, (id_usuario, id_curso))
        return self.db.obtener_uno() is not None

    def inscribir_usuario(self, id_usuario, id_curso):
        id_estado_inscrito = self.obtener_id_estado("Inscrito")
        if not id_estado_inscrito:
            return {"exito": False, "mensaje": "Estado 'Inscrito' no encontrado."}

        consulta = """
            INSERT INTO inscripciones (fecha_inscripcion, progreso, id_usuario, id_curso, id_estado)
            VALUES (CURDATE(), 0, %s, %s, %s)
        """
        try:
            self.db.ejecutar(consulta, (id_usuario, id_curso, id_estado_inscrito))
            self.db.confirmar()
            return {"exito": True, "mensaje": "Inscripción realizada correctamente."}
        except Exception as e:
            return {"exito": False, "mensaje": f"Error al inscribir usuario: {e}"}
    
    def listar_por_usuario(self, id_usuario):
        """Devuelve todas las inscripciones asociadas a un usuario."""
        consulta = """
            SELECT 
                i.id_inscripcion,
                i.id_curso,
                c.titulo_curso,
                i.fecha_inscripcion,
                e.nombre_estado,
                i.progreso
            FROM inscripciones i
            JOIN cursos c ON i.id_curso = c.id_curso
            JOIN estados e ON i.id_estado = e.id_estado
            WHERE i.id_usuario = %s
            ORDER BY i.fecha_inscripcion DESC
        """
        self.db.ejecutar(consulta, (id_usuario,))
        return self.db.obtener_todos()

    # ====================================================
    #                  ACTUALIZAR PROGRESO
    # ====================================================
    def actualizar_progreso(self, id_usuario, id_curso, progreso):
        """
        Actualiza el progreso del usuario (0–100%).
        """
        print("[DeBug] Dentro de Actualizar Progreso con:\nID Usuario:", id_usuario, "ID Curso:", id_curso, "Progreso:", progreso)
        consulta = """
            UPDATE inscripciones
            SET progreso = %s
            WHERE id_usuario = %s AND id_curso = %s
        """
        try:
            self.db.ejecutar(consulta, (progreso, id_usuario, id_curso))
            self.db.confirmar()
            return {"exito": True, "mensaje": "Progreso actualizado correctamente."}
        except Exception as e:
            return {"exito": False, "mensaje": f"Error al actualizar progreso: {e}"}

    # ====================================================
    #           CONSULTAS Y CÁLCULOS DE PROGRESO
    # ====================================================
    def obtener_por_usuario_y_curso(self, id_usuario, id_curso):
        consulta = """
            SELECT * 
            FROM inscripciones
            WHERE id_usuario = %s AND id_curso = %s
        """
        self.db.ejecutar(consulta, (id_usuario, id_curso))
        return self.db.obtener_uno()

    def registrar_calificacion_si_no_existe(self, id_usuario, id_evaluacion):
        consulta_verificar = """
            SELECT 1 FROM calificaciones
            WHERE id_usuario = %s AND id_evaluacion = %s
        """
        self.db.ejecutar(consulta_verificar, (id_usuario, id_evaluacion))
        existe = self.db.obtener_uno()

        if not existe:
            consulta_insert = """
                INSERT INTO calificaciones (id_usuario, id_evaluacion, calificacion)
                VALUES (%s, %s, %s)
            """
            self.db.ejecutar(consulta_insert, (id_usuario, id_evaluacion, 100))
            self.db.confirmar()

    def calcular_progreso(self, id_usuario, id_curso, total_lecciones):
        """
        Calcula el progreso del usuario basado en las lecciones completadas.
        """
        consulta = """
            SELECT COUNT(DISTINCT e.id_leccion) AS completadas
            FROM calificaciones c
            JOIN evaluaciones e ON e.id_evaluacion = c.id_evaluacion
            WHERE c.id_usuario = %s
              AND e.id_leccion IN (SELECT id_leccion FROM lecciones WHERE id_curso = %s)
        """
        self.db.ejecutar(consulta, (id_usuario, id_curso))
        resultado = self.db.obtener_uno()
        completadas = resultado["completadas"] if resultado else 0
        progreso = int((completadas / total_lecciones) * 100) if total_lecciones > 0 else 0
        return min(progreso, 100)
