from .database import Database

class Categoria:
    def __init__(self):
        self.db = Database()

    def obtener_todas(self):
        consulta = """
            SELECT id_categoria, nombre_categoria, descripcion_categoria
            FROM categorias
            ORDER BY nombre_categoria ASC;
        """
        self.db.ejecutar(consulta)
        return self.db.obtener_todos()
