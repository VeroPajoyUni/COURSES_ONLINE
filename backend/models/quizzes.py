from .database import Database
from datetime import date


class Quiz:
    def __init__(self):
        self.db = Database()

    # ====================================================
    #               OBTENER QUIZZES Y PREGUNTAS
    # ====================================================
    def obtener_por_leccion(self, id_leccion):
        consulta = """
            SELECT 
                e.id_evaluacion,
                e.fecha_evaluacion,
                e.id_tipo,
                t.nombre_tipo,
                e.id_leccion
            FROM evaluaciones e
            JOIN tipos_evaluaciones t ON e.id_tipo = t.id_tipo
            WHERE e.id_leccion = %s
        """
        self.db.ejecutar(consulta, (id_leccion,))
        evaluaciones = self.db.obtener_todos()

        for e in evaluaciones:
            e["preguntas"] = self.obtener_preguntas(e["id_evaluacion"])
        return evaluaciones

    def obtener_preguntas(self, id_evaluacion):
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
        preguntas_raw = self.db.obtener_todos()

        # Agrupar respuestas por pregunta
        preguntas_dict = {}
        for fila in preguntas_raw:
            pid = fila["id_preguntas"]
            if pid not in preguntas_dict:
                preguntas_dict[pid] = {
                    "id_preguntas": pid,
                    "pregunta": fila["pregunta"],
                    "respuestas": [],
                }
            if fila["id_respuesta"]:
                preguntas_dict[pid]["respuestas"].append(
                    {
                        "id_respuesta": fila["id_respuesta"],
                        "opciones": fila["opciones"],
                        "es_correcta": fila["es_correcta"],
                    }
                )
        return list(preguntas_dict.values())

    # ====================================================
    #                 CREAR QUIZ
    # ====================================================
    def crear(self, id_leccion, datos):
        # Crear la evaluación tipo Quiz (id_tipo = 1)
        consulta_eval = """
            INSERT INTO evaluaciones (fecha_evaluacion, id_tipo, id_leccion)
            VALUES (%s, %s, %s)
        """
        valores_eval = (date.today(), 1, id_leccion)
        self.db.ejecutar(consulta_eval, valores_eval)
        id_eval = self.db.ultimo_id_insertado()

        # Insertar preguntas con sus respuestas
        for pregunta in datos.get("preguntas", []):
            self._insertar_pregunta_y_respuestas(id_eval, pregunta)

        self.db.confirmar()
        return id_eval

    def _insertar_pregunta_y_respuestas(self, id_evaluacion, pregunta):
        consulta_p = """
            INSERT INTO preguntas (pregunta, id_evaluacion)
            VALUES (%s, %s)
        """
        self.db.ejecutar(consulta_p, (pregunta["pregunta"], id_evaluacion))
        id_preg = self.db.ultimo_id_insertado()

        for r in pregunta.get("respuestas", []):
            consulta_r = """
                INSERT INTO respuestas (opciones, es_correcta, id_pregunta)
                VALUES (%s, %s, %s)
            """
            self.db.ejecutar(consulta_r, (r["opciones"], r["es_correcta"], id_preg))

    # ====================================================
    #                 ACTUALIZAR QUIZ
    # ====================================================
    def actualizar_pregunta(self, id_pregunta, datos):
        # Actualizar el texto de la pregunta
        self.db.ejecutar(
            "UPDATE preguntas SET pregunta = %s WHERE id_preguntas = %s",
            (datos["pregunta"], id_pregunta),
        )

        # Eliminar respuestas actuales y reinsertar
        self.db.ejecutar("DELETE FROM respuestas WHERE id_pregunta = %s", (id_pregunta,))
        for r in datos["respuestas"]:
            self.db.ejecutar(
                "INSERT INTO respuestas (opciones, es_correcta, id_pregunta) VALUES (%s, %s, %s)",
                (r["opciones"], r["es_correcta"], id_pregunta),
            )

        self.db.confirmar()
        return True

    # ====================================================
    #                 ELIMINAR QUIZ O PREGUNTA
    # ====================================================
    def eliminar(self, id_evaluacion):
        self.db.ejecutar(
            "DELETE FROM respuestas WHERE id_pregunta IN (SELECT id_preguntas FROM preguntas WHERE id_evaluacion = %s)",
            (id_evaluacion,),
        )
        self.db.ejecutar("DELETE FROM preguntas WHERE id_evaluacion = %s", (id_evaluacion,))
        self.db.ejecutar("DELETE FROM evaluaciones WHERE id_evaluacion = %s", (id_evaluacion,))
        self.db.confirmar()
        return True

    def eliminar_pregunta(self, id_pregunta):
        self.db.ejecutar("DELETE FROM respuestas WHERE id_pregunta = %s", (id_pregunta,))
        self.db.ejecutar("DELETE FROM preguntas WHERE id_preguntas = %s", (id_pregunta,))
        self.db.confirmar()
        return True
