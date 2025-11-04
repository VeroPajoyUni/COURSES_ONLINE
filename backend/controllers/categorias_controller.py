from models.categorias import Categoria
from utils.response import manejar_exito, manejar_error


class CategoriasController:
    def __init__(self):
        self.categoria = Categoria()

    def listar_categorias(self):
        """Obtiene todas las categorías de cursos."""
        try:
            categorias = self.categoria.obtener_todas()
            return manejar_exito(categorias, "Categorías obtenidas correctamente")
        except Exception as e:
            return manejar_error(e, "Error al listar las categorías")
