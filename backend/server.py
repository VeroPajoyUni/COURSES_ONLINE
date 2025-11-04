from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from urllib.parse import urlparse
import re
from datetime import date, datetime
from controllers.cursos_controller import CursosController
from controllers.auth_controller import AuthController
from controllers.inscripciones_controller import InscripcionesController
from controllers.categorias_controller import CategoriasController
from controllers.lecciones_controller import LeccionesController
from controllers.quizzes_controller import QuizzesController

class ServidorBasico(BaseHTTPRequestHandler):

    # ==============================
    #         PETICIONES GET
    # ==============================
    def do_GET(self):
        ruta = urlparse(self.path).path

        if ruta == "/api/cursos":
            cursos = CursosController().listar_cursos()
            self._enviar_respuesta(200, cursos)

        elif re.match(r"^/api/gestion-cursos/\d+$", ruta):
            id_instructor = int(ruta.split("/")[-1])
            cursos = CursosController().listar_cursos_por_instructor(id_instructor)
            self._enviar_respuesta(200, cursos)

        elif re.match(r"^/api/cursos/\d+$", ruta):
            id_curso = int(ruta.split("/")[-1])
            curso = CursosController().obtener_detalle_curso(id_curso)
            if curso:
                self._enviar_respuesta(200, curso)
            else:
                self._enviar_respuesta(404, {"mensaje": "Curso no encontrado"})

        elif ruta == "/api/roles":
            roles = AuthController().obtener_roles()
            self._enviar_respuesta(200, roles)

        elif ruta == "/api/tipos-documento":
            tipos = AuthController().obtener_tipos_documento()
            self._enviar_respuesta(200, tipos)

        elif re.match(r"^/api/inscripciones/usuario/\d+$", ruta):
            id_usuario = int(ruta.split("/")[-1])
            inscripciones = InscripcionesController().listar_por_usuario(id_usuario)
            self._enviar_respuesta(200, inscripciones)

        elif ruta == "/api/categorias":
            categorias = CategoriasController().listar_categorias()
            self._enviar_respuesta(200, categorias)

        elif re.match(r"^/api/lecciones/curso/\d+$", ruta):
            id_curso = int(ruta.split("/")[-1])
            lecciones = LeccionesController().listar_por_curso(id_curso)
            self._enviar_respuesta(200, lecciones)

        elif re.match(r"^/api/quizzes/leccion/\d+$", ruta):
            id_leccion = int(ruta.split("/")[-1])
            quiz = QuizzesController().listar_por_leccion(id_leccion)
            self._enviar_respuesta(200, quiz)

        else:
            self._enviar_respuesta(404, {"mensaje": "Ruta no encontrada"})

    # ==============================
    #         PETICIONES POST
    # ==============================
    def do_POST(self):
        ruta = urlparse(self.path).path
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        try:
            datos = json.loads(body.decode("utf-8")) if body else {}
        except json.JSONDecodeError:
            datos = {}

        if ruta == "/api/login":
            correo = datos.get("correo")
            contrasenia = datos.get("contrasenia")
            respuesta = AuthController().login(correo, contrasenia)
            codigo = 200 if respuesta["exito"] else 401
            self._enviar_respuesta(codigo, respuesta)

        elif ruta == "/api/register":
            nombre = datos.get("nombre")
            correo = datos.get("correo")
            contrasenia = datos.get("contrasenia")
            id_rol = datos.get("id_rol")
            id_tipo_documento = datos.get("id_tipo_documento")
            numero_identificacion = datos.get("numero_identificacion")
            respuesta = AuthController().registrar(nombre, correo, contrasenia, id_rol, id_tipo_documento, numero_identificacion)
            codigo = 201 if respuesta["exito"] else 400
            self._enviar_respuesta(codigo, respuesta)

        elif ruta == "/api/inscripciones":
            id_usuario = datos.get("id_usuario")
            id_curso = datos.get("id_curso")
            respuesta = InscripcionesController().inscribir(id_usuario, id_curso)
            codigo = 200 if respuesta["exito"] else 400
            self._enviar_respuesta(codigo, respuesta)

        elif ruta == "/api/cursos":
            respuesta = CursosController().crear_curso(datos)
            if respuesta["exito"]:
                respuesta["mensaje"] = "Curso creado exitosamente"
            codigo = 201 if respuesta["exito"] else 400
            self._enviar_respuesta(codigo, respuesta)

        elif ruta == "/api/lecciones":
            respuesta = LeccionesController().crear_leccion(datos)
            codigo = 201 if respuesta["exito"] else 400
            self._enviar_respuesta(codigo, respuesta)

        elif re.match(r"^/api/quizzes/leccion/\d+$", ruta):
            id_leccion = int(ruta.split("/")[-1])
            respuesta = QuizzesController().crear_quiz(id_leccion, datos)
            codigo = 201 if respuesta["exito"] else 400
            self._enviar_respuesta(codigo, respuesta)

        else:
            self._enviar_respuesta(404, {"mensaje": "Ruta no encontrada"})

    # ==============================
    #         PETICIÓN PUT
    # ==============================
    def do_PUT(self):
        ruta = urlparse(self.path).path
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        datos = json.loads(body.decode("utf-8")) if body else {}

        if re.match(r"^/api/cursos/\d+$", ruta):
            id_curso = int(ruta.split("/")[-1])
            respuesta = CursosController().actualizar_curso(id_curso, datos)

            if respuesta.get("sin_cambios"):
                self._enviar_respuesta(200, {"exito": True, "mensaje": "No se realizaron modificaciones"})
            elif respuesta["exito"]:
                respuesta["mensaje"] = "Curso actualizado correctamente"
                self._enviar_respuesta(200, respuesta)
            else:
                self._enviar_respuesta(400, respuesta)

        elif re.match(r"^/api/lecciones/\d+$", ruta):
            id_leccion = int(ruta.split("/")[-1])
            respuesta = LeccionesController().actualizar_leccion(id_leccion, datos)
            codigo = 200 if respuesta["exito"] else 400
            self._enviar_respuesta(codigo, respuesta)

        else:
            self._enviar_respuesta(404, {"exito": False, "mensaje": "Ruta no encontrada"})

    # ==============================
    #         PETICIÓN DELETE
    # ==============================
    def do_DELETE(self):
        ruta = urlparse(self.path).path

        if re.match(r"^/api/cursos/\d+$", ruta):
            id_curso = int(ruta.split("/")[-1])
            respuesta = CursosController().eliminar_curso(id_curso)
            if respuesta["exito"]:
                respuesta["mensaje"] = "Curso eliminado exitosamente"
            codigo = 200 if respuesta["exito"] else 400
            self._enviar_respuesta(codigo, respuesta)

        elif re.match(r"^/api/lecciones/\d+$", ruta):
            id_leccion = int(ruta.split("/")[-1])
            respuesta = LeccionesController().eliminar_leccion(id_leccion)
            codigo = 200 if respuesta["exito"] else 400
            self._enviar_respuesta(codigo, respuesta)

        elif re.match(r"^/api/quizzes/\d+$", ruta):
            id_eval = int(ruta.split("/")[-1])
            respuesta = QuizzesController().eliminar_quiz(id_eval)
            codigo = 200 if respuesta["exito"] else 400
            self._enviar_respuesta(codigo, respuesta)

        else:
            self._enviar_respuesta(404, {"exito": False, "mensaje": "Ruta no encontrada"})

    # ==============================
    #         OPCIONES CORS
    # ==============================
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    # ==============================
    #   MÉTODOS AUXILIARES
    # ==============================
    def _enviar_respuesta(self, codigo, contenido):
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(
            json.dumps(contenido, ensure_ascii=False, indent=2, default=self._convertir_fecha).encode("utf-8")
        )

    def _convertir_fecha(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        raise TypeError(f"Tipo {type(obj)} no es serializable")


if __name__ == "__main__":
    servidor = HTTPServer(("localhost", 5000), ServidorBasico)
    print("Servidor corriendo en http://localhost:5000")
    servidor.serve_forever()
