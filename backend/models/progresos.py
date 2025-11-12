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
        resp = self.db.obtener_uno()
        print("[DeBug]: Consulta de validación ejecutada.", resp)
        # Retorna True si existe un registro, False si no existe
        return resp is not None
    
    def leccion_completada(self, id_usuario, id_curso, id_leccion):
        consulta = """
            INSERT INTO progresos (id_usuario, id_curso, id_leccion, leccion_completada)
            VALUES (%s, %s, %s, %s)
        """
        try:
            print("[DeBug]: Bandera antes de ejecutar la consulta de lección completada.")
            print(f"[DeBug]: Datos a insertar - Usuario: {id_usuario}, Curso: {id_curso}, Lección: {id_leccion}")
            self.db.ejecutar(consulta, (id_usuario, id_curso, id_leccion, 1))
            # Hacer commit explícito para asegurar que se guarde
            self.db.confirmar()
            print("[DeBug]: Consulta de lección completada ejecutada y confirmada.")
            return True
        except Exception as e:
            print(f"[DeBug]: Error al insertar progreso: {e}")
            self.db.connection.rollback()  # Hacer rollback en caso de error
            raise e
    
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