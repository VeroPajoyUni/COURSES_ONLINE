from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from urllib.parse import urlparse
from controllers.cursos_controller import CursosController

class ServidorBasico(BaseHTTPRequestHandler):
    def do_GET(self):
        ruta = urlparse(self.path).path

        if ruta == "/api/cursos":
            cursos = CursosController().listar_cursos()
            self._enviar_respuesta(200, cursos)
        else:
            self._enviar_respuesta(404, {"mensaje": "Ruta no encontrada"})

    def _enviar_respuesta(self, codigo, contenido):
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")  # permite la conexión desde el frontend
        self.end_headers()
        self.wfile.write(json.dumps(contenido, ensure_ascii=False, indent=2).encode("utf-8"))

if __name__ == "__main__":
    servidor = HTTPServer(("localhost", 5000), ServidorBasico)
    print("Servidor corriendo en http://localhost:5000")
    servidor.serve_forever()
