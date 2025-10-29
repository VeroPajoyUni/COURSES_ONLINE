from models.categorias import Categoria

class CategoriasController:
    def __init__(self):
        self.categoria = Categoria()

    def listar_categorias(self):
        return self.categoria.obtener_todas()
