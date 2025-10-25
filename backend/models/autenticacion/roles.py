from ..database import Database

class Roles:
    def __init__(self):
        self.db = Database()

    def obtener_roles(self):
        """
        Obtiene todos los roles disponibles.
        """
        consulta = "SELECT id_rol, nombre_rol FROM roles"
        self.db.ejecutar(consulta)
        return self.db.obtener_todos()
