from models.lecciones import Leccion
from utils.response import manejar_exito, manejar_error, manejar_accion_exitosa


class LeccionesController:
    def __init__(self):
        self.leccion = Leccion()

    # ====================================================
    #             LISTAR LECCIONES
    # ====================================================
    def listar_por_curso(self, id_curso):
        try:
            lecciones = self.leccion.obtener_por_curso(id_curso)
            mensaje = (
                "Lecciones obtenidas correctamente"
                if lecciones
                else "No hay lecciones registradas para este curso"
            )
            return manejar_exito(lecciones, mensaje)
        except Exception as e:
            return manejar_error(e, "Error al obtener las lecciones del curso")

    # ====================================================
    #             CREAR LECCIÓN
    # ====================================================
    def crear_leccion(self, datos):
        try:
            titulo = datos.get("titulo_leccion", "").strip()
            descripcion = datos.get("descripcion_leccion", "").strip()
            id_curso = datos.get("id_curso")

            if not titulo or not descripcion or not id_curso:
                raise Exception("Todos los campos son obligatorios")

            if len(descripcion) < 15:
                raise Exception("La descripción debe tener al menos 15 caracteres")

            self.leccion.crear(datos)
            return manejar_accion_exitosa("Lección creada exitosamente")
        except Exception as e:
            return manejar_error(e, "Error al crear la lección")

    # ====================================================
    #             ACTUALIZAR LECCIÓN
    # ====================================================
    def actualizar_leccion(self, id_leccion, datos):
        try:
            resultado = self.leccion.actualizar(id_leccion, datos)
            if resultado.get("sin_cambios"):
                return {"exito": True, "mensaje": "No se realizaron modificaciones"}
            return manejar_accion_exitosa("Lección actualizada correctamente")
        except Exception as e:
            return manejar_error(e, "Error al actualizar la lección")

    # ====================================================
    #             ELIMINAR LECCIÓN
    # ====================================================
    def eliminar_leccion(self, id_leccion):
        try:
            self.leccion.eliminar(id_leccion)
            return manejar_accion_exitosa("Lección eliminada exitosamente")
        except Exception as e:
            return manejar_error(e, "Error al eliminar la lección")
