from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from urllib.parse import urlparse
from controllers.cursos_controller import CursosController
from controllers.auth_controller import AuthController

class ServidorBasico(BaseHTTPRequestHandler):
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
        else:
            self._enviar_respuesta(404, {"mensaje": "Ruta no encontrada"})

    def do_POST(self):
        ruta = urlparse(self.path).path
        
        # Leer el cuerpo de la petición
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        datos = json.loads(body.decode('utf-8'))

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
            
            respuesta = AuthController().registrar(nombre, correo, contrasenia, id_rol, id_tipo_documento)
            
            codigo = 201 if respuesta["exito"] else 400
            self._enviar_respuesta(codigo, respuesta)
        else:
            self._enviar_respuesta(404, {"mensaje": "Ruta no encontrada"})

    def do_OPTIONS(self):
        """Maneja las peticiones OPTIONS para CORS"""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _enviar_respuesta(self, codigo, contenido):
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(contenido, ensure_ascii=False, indent=2).encode("utf-8"))

if __name__ == "__main__":
    servidor = HTTPServer(("localhost", 5000), ServidorBasico)
    print("Servidor corriendo en http://localhost:5000")
    servidor.serve_forever()