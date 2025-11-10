from models.autenticacion import Auth
from utils.response import manejar_exito, manejar_error

class AuthController:
    def __init__(self):
        # Inicializa la clase Auth que agrupa las funcionalidades de autenticación, roles y tipos de documento
        self.auth = Auth()

    def login(self, correo, contrasenia):
        """
        Procesa el inicio de sesión.
        """
        if not correo or not contrasenia:
            return manejar_error(Exception("Campos vacíos"), "Correo y contraseña son obligatorios")

        try:
            usuario = self.auth.verificar_credenciales(correo, contrasenia)
            print("[DeBug]: Usuario autenticado:", usuario)
            return manejar_exito(usuario, "Inicio de sesión exitoso")
        except Exception as e:
            return manejar_error(e, "Correo o contraseña incorrectos")

    def registrar(self, nombre, correo, contrasenia, id_rol, id_tipo_documento, numero_identificacion):
        """
        Procesa el registro de un nuevo usuario.
        """
        # Validaciones de campos
        if not nombre or not correo or not contrasenia or not id_rol or not id_tipo_documento or not numero_identificacion:
            return {
                "exito": False,
                "mensaje": "Todos los campos son obligatorios"
            }

        if len(contrasenia) < 6:
            return {
                "exito": False,
                "mensaje": "La contraseña debe tener al menos 6 caracteres"
            }

        # Verificar si el correo ya está registrado
        if self.auth.correo_existe(correo):
            return {
                "exito": False,
                "mensaje": "El correo electrónico ya está registrado"
            }

        # Intentar registrar el usuario
        registrado = self.auth.registrar_usuario(
            nombre, correo, contrasenia, id_rol, id_tipo_documento, numero_identificacion
        )
        
        if registrado:
            return {
                "exito": True,
                "mensaje": "Usuario registrado exitosamente"
            }
        else:
            return {
                "exito": False,
                "mensaje": "Error al registrar el usuario. Intenta nuevamente."
            }

    def obtener_roles(self):
        """
        Obtiene todos los roles disponibles.
        """
        try:
            roles = self.auth.obtener_roles()
            return {
                "exito": True,
                "roles": roles
            }
        except Exception as e:
            return {
                "exito": False,
                "mensaje": f"Error al obtener roles: {e}"
            }

    def obtener_tipos_documento(self):
        """
        Obtiene todos los tipos de documento disponibles.
        """
        try:
            tipos = self.auth.obtener_tipos_documento()
            return {
                "exito": True,
                "tipos_documento": tipos
            }
        except Exception as e:
            return {
                "exito": False,
                "mensaje": f"Error al obtener tipos de documento: {e}"
            }