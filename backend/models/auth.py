from .database import Database
import hashlib

class Auth:
    def __init__(self):
        self.db = Database()

    def verificar_credenciales(self, correo, contrasenia):
        """
        Verifica si el correo y contraseña son correctos.
        Retorna los datos del usuario si son válidos, None si no.
        """
        # Encriptar la contraseña con SHA-256
        contrasenia_hash = hashlib.sha256(contrasenia.encode()).hexdigest()
        
        consulta = """
            SELECT 
                u.id_usuario, 
                u.nombre_usuario, 
                u.correo, 
                r.nombre_rol,
                u.id_rol
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.correo = %s AND u.contrasenia = %s
        """
        
        self.db.ejecutar(consulta, (correo, contrasenia_hash))
        usuario = self.db.obtener_uno()
        
        return usuario

    def correo_existe(self, correo):
        """
        Verifica si un correo ya está registrado.
        """
        consulta = "SELECT id_usuario FROM usuarios WHERE correo = %s"
        self.db.ejecutar(consulta, (correo,))
        return self.db.obtener_uno() is not None

    def registrar_usuario(self, nombre, correo, contrasenia, id_rol, id_tipo_documento, numero_identificacion):
        """
        Registra un nuevo usuario en la base de datos.
        """
        # Encriptar la contraseña con SHA-256
        contrasenia_hash = hashlib.sha256(contrasenia.encode()).hexdigest()
        
        consulta = """
            INSERT INTO usuarios 
            (nombre_usuario, correo, contrasenia, id_rol, id_tipo_documento, numero_identificacion)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        try:
            self.db.ejecutar(consulta, (nombre, correo, contrasenia_hash, id_rol, id_tipo_documento, numero_identificacion))
            return True
        except Exception as e:
            print(f"Error al registrar usuario: {e}")
            return False

    def obtener_roles(self):
        """
        Obtiene todos los roles disponibles.
        """
        consulta = "SELECT id_rol, nombre_rol FROM roles"
        self.db.ejecutar(consulta)
        return self.db.obtener_todos()

    def obtener_tipos_documento(self):
        """
        Obtiene todos los tipos de documento disponibles.
        """
        consulta = "SELECT id_tipo_documento, nombre_documento FROM tipo_documentos"
        self.db.ejecutar(consulta)
        return self.db.obtener_todos()