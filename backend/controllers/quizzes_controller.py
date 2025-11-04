from models.quizzes import Quiz
from utils.response import manejar_exito, manejar_error, manejar_accion_exitosa


class QuizzesController:
    def __init__(self):
        self.quiz = Quiz()

    # ====================================================
    #             LISTAR QUIZZES POR LECCIÓN
    # ====================================================
    def listar_por_leccion(self, id_leccion):
        try:
            quizzes = self.quiz.obtener_por_leccion(id_leccion)
            mensaje = (
                "Quiz encontrado correctamente"
                if quizzes
                else "No hay quiz asociado a esta lección"
            )
            return manejar_exito(quizzes, mensaje)
        except Exception as e:
            return manejar_error(e, "Error al obtener quiz de la lección")

    # ====================================================
    #             CREAR QUIZ CON PREGUNTAS
    # ====================================================
    def crear_quiz(self, id_leccion, datos):
        try:
            preguntas = datos.get("preguntas", [])
            if not preguntas:
                raise Exception("Debe incluir al menos una pregunta")

            if len(preguntas) > 5:
                raise Exception("El quiz no puede tener más de 5 preguntas")

            # Validar estructura de preguntas y respuestas
            for i, p in enumerate(preguntas, start=1):
                if not p.get("pregunta") or not p.get("respuestas"):
                    raise Exception(f"La pregunta {i} está incompleta")

                respuestas = p["respuestas"]
                correctas = [r for r in respuestas if r.get("es_correcta") == "true"]
                if len(correctas) != 1:
                    raise Exception(
                        f"La pregunta {i} debe tener exactamente una respuesta correcta"
                    )

            self.quiz.crear(id_leccion, datos)
            return manejar_accion_exitosa("Quiz creado exitosamente")
        except Exception as e:
            return manejar_error(e, "Error al crear el quiz")

    # ====================================================
    #             ACTUALIZAR PREGUNTA DE QUIZ
    # ====================================================
    def actualizar_pregunta(self, id_pregunta, datos):
        try:
            self.quiz.actualizar_pregunta(id_pregunta, datos)
            return manejar_accion_exitosa("Pregunta actualizada correctamente")
        except Exception as e:
            return manejar_error(e, "Error al actualizar la pregunta")

    # ====================================================
    #             ELIMINAR QUIZ O PREGUNTA
    # ====================================================
    def eliminar_quiz(self, id_evaluacion):
        try:
            self.quiz.eliminar(id_evaluacion)
            return manejar_accion_exitosa("Quiz eliminado exitosamente")
        except Exception as e:
            return manejar_error(e, "Error al eliminar el quiz")

    def eliminar_pregunta(self, id_pregunta):
        try:
            self.quiz.eliminar_pregunta(id_pregunta)
            return manejar_accion_exitosa("Pregunta eliminada exitosamente")
        except Exception as e:
            return manejar_error(e, "Error al eliminar la pregunta")
