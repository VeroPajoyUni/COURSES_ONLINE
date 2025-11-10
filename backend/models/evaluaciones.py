from .database import Database
from datetime import date

class Evaluaciones:
    def __init__(self):
        self.db = Database()

    # ====================================================
    #                 CREAR EVALUACIÓN
    # ====================================================
    def crear(self, id_leccion, id_tipo=1):
        """
        Crea una evaluación asociada a una lección.
        id_tipo = 1 → Quiz
        id_tipo = 2 → Evaluación Final
        """
        consulta = """
            INSERT INTO evaluaciones (fecha_evaluacion, id_tipo, id_leccion)
            VALUES (%s, %s, %s)
        """
        valores = (date.today(), id_tipo, id_leccion)
        self.db.ejecutar(consulta, valores)
        self.db.confirmar()
        return self.db.ultimo_id_insertado()

    # ====================================================
    #             OBTENER EVALUACIONES POR LECCIÓN
    # ====================================================
    def obtener_por_leccion(self, id_leccion):
        """
        Devuelve todas las evaluaciones asociadas a una lección.
        """
        consulta = """
            SELECT 
                e.id_evaluacion,
                e.fecha_evaluacion,
                e.id_tipo,
                t.nombre_tipo AS tipo_evaluacion,
                e.id_leccion
            FROM evaluaciones e
            JOIN tipos_evaluaciones t ON e.id_tipo = t.id_tipo
            WHERE e.id_leccion = %s
            ORDER BY e.id_evaluacion ASC
        """
        self.db.ejecutar(consulta, (id_leccion,))
        return self.db.obtener_todos()

    # ====================================================
    #             OBTENER DETALLE DE EVALUACIÓN
    # ====================================================
    def obtener_detalle(self, id_evaluacion):
        """
        Retorna los datos de la evaluación junto con sus preguntas y respuestas.
        """
        consulta = """
            SELECT 
                e.id_evaluacion,
                e.fecha_evaluacion,
                e.id_tipo,
                t.nombre_tipo AS tipo_evaluacion,
                e.id_leccion
            FROM evaluaciones e
            JOIN tipos_evaluaciones t ON e.id_tipo = t.id_tipo
            WHERE e.id_evaluacion = %s
        """
        self.db.ejecutar(consulta, (id_evaluacion,))
        evaluacion = self.db.obtener_uno()
        if not evaluacion:
            return None

        evaluacion["preguntas"] = self.obtener_preguntas_y_respuestas(id_evaluacion)
        return evaluacion

    # ====================================================
    #        OBTENER PREGUNTAS Y RESPUESTAS ASOCIADAS
    # ====================================================
    def obtener_preguntas_y_respuestas(self, id_evaluacion):
        consulta = """
            SELECT 
                p.id_preguntas,
                p.pregunta,
                r.id_respuesta,
                r.opciones,
                r.es_correcta
            FROM preguntas p
            LEFT JOIN respuestas r ON p.id_preguntas = r.id_pregunta
            WHERE p.id_evaluacion = %s
            ORDER BY p.id_preguntas ASC
        """
        self.db.ejecutar(consulta, (id_evaluacion,))
        filas = self.db.obtener_todos()

        preguntas = {}
        for fila in filas:
            pid = fila["id_preguntas"]
            if pid not in preguntas:
                preguntas[pid] = {
                    "id_preguntas": pid,
                    "pregunta": fila["pregunta"],
                    "respuestas": [],
                }
            if fila["id_respuesta"]:
                preguntas[pid]["respuestas"].append({
                    "id_respuesta": fila["id_respuesta"],
                    "opciones": fila["opciones"],
                    "es_correcta": fila["es_correcta"],
                })
        return list(preguntas.values())

    # ====================================================
    #         OBTENER O CREAR EVALUACIÓN POR LECCIÓN
    # ====================================================
    def obtener_o_crear_por_leccion(self, id_leccion, id_tipo=1):
        """
        Si no existe una evaluación del tipo especificado, se crea automáticamente.
        """
        consulta = """
            SELECT id_evaluacion
            FROM evaluaciones
            WHERE id_leccion = %s AND id_tipo = %s
        """
        self.db.ejecutar(consulta, (id_leccion, id_tipo))
        existente = self.db.obtener_uno()

        if existente:
            return existente["id_evaluacion"]
        return self.crear(id_leccion, id_tipo)
