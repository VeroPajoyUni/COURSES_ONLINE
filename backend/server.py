from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from urllib.parse import urlparse
import re
from datetime import date, datetime
from controllers.cursos_controller import CursosController
from controllers.auth_controller import AuthController
from controllers.inscripciones_controller import InscripcionesController
from controllers.categorias_controller import CategoriasController

class ServidorBasico(BaseHTTPRequestHandler):
    # ==============================
    #         PETICIONES GET
    # ==============================
    def do_GET(self):
        ruta = urlparse(self.path).path

        if ruta == "/api/cursos":
            cursos = CursosController().listar_cursos()
            self._enviar_respuesta(200, cursos)

        elif ruta == "/api/roles":
            roles = AuthController().obtener_roles()
            self._enviar_respuesta(200, roles)

        elif ruta == "/api/tipos-documento":
            tipos = AuthController().obtener_tipos_documento()
            self._enviar_respuesta(200, tipos)

        elif re.match(r"^/api/cursos/\d+$", ruta):
            # Extraer el ID del curso
            id_curso = int(ruta.split("/")[-1])
            curso = CursosController().obtener_detalle_curso(id_curso)
            if curso:
                self._enviar_respuesta(200, curso)
            else:
                self._enviar_respuesta(404, {"mensaje": "Curso no encontrado"})

        elif re.match(r"^/api/inscripciones/usuario/\d+$", ruta):
            id_usuario = int(ruta.split("/")[-1])
            print(f"Consultando inscripciones para usuario {id_usuario}")
            inscripciones = InscripcionesController().listar_por_usuario(id_usuario)
            self._enviar_respuesta(200, inscripciones)

        elif ruta == "/api/categorias":
            categorias = CategoriasController().listar_categorias()
            self._enviar_respuesta(200, categorias)

        else:
            self._enviar_respuesta(404, {"mensaje": "Ruta no encontrada"})

    # ==============================
    #         PETICIONES POST
    # ==============================
    def do_POST(self):
        ruta = urlparse(self.path).path
        print(f"POST recibido: {ruta}")

        # Leer el cuerpo de la petición
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

        else:
            self._enviar_respuesta(404, {"mensaje": "Ruta no encontrada"})

    # ==============================
    #         OPCIONES CORS
    # ==============================
    def do_OPTIONS(self):
        """Maneja las peticiones OPTIONS para CORS"""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
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
        """Convierte objetos date y datetime a string para JSON"""
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        raise TypeError(f"Tipo {type(obj)} no es serializable")

if __name__ == "__main__":
    servidor = HTTPServer(("localhost", 5000), ServidorBasico)
    print("Servidor corriendo en http://localhost:5000")
    servidor.serve_forever()
