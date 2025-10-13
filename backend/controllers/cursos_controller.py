from models.cursos import Curso

class CursosController:
    def __init__(self):
        self.curso = Curso()

    def listar_cursos(self):
        return self.curso.obtener_todos()
