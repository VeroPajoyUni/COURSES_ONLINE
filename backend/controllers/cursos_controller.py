from models.cursos import Curso

class CursosController:
    def __init__(self):
        self.curso = Curso()

    def listar_cursos(self):
        return self.curso.obtener_todos()

    def obtener_detalle_curso(self, id_curso):
        """
        Obtiene el detalle completo de un curso incluyendo sus lecciones.
        """
        curso = self.curso.obtener_por_id(id_curso)
        
        if not curso:
            return None
        
        # Obtener lecciones del curso
        lecciones = self.curso.obtener_lecciones(id_curso)
        
        # Obtener cantidad de estudiantes inscritos
        total_estudiantes = self.curso.contar_estudiantes_inscritos(id_curso)
        
        # Construir respuesta completa
        curso['lecciones'] = lecciones
        curso['total_estudiantes'] = total_estudiantes
        curso['total_lecciones'] = len(lecciones)
        
        return curso