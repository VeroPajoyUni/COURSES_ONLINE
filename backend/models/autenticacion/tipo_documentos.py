from ..database import Database

class TipoDocumentos:
    def __init__(self):
        self.db = Database()

    def obtener_tipos_documento(self):
        """
        Obtiene todos los tipos de documento disponibles.
        """
        consulta = "SELECT id_tipo_documento, nombre_documento FROM tipo_documentos"
        self.db.ejecutar(consulta)
        return self.db.obtener_todos()
