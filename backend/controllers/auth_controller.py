from models.auth import Auth

class AuthController:
    def __init__(self):
        self.auth = Auth()

    def login(self, correo, contrasenia):
        """
        Procesa el inicio de sesión.
        """
        if not correo or not contrasenia:
            return {
                "exito": False,
                "mensaje": "Correo y contraseña son obligatorios"
            }

        usuario = self.auth.verificar_credenciales(correo, contrasenia)

        if usuario:
            return {
                "exito": True,
                "mensaje": "Inicio de sesión exitoso",
                "usuario": {
                    "id": usuario["id_usuario"],
                    "nombre": usuario["nombre_usuario"],
                    "correo": usuario["correo"],
                    "rol": usuario["nombre_rol"],
                    "id_rol": usuario["id_rol"]
                }
            }
        else:
            return {
                "exito": False,
                "mensaje": "Correo o contraseña incorrectos"
            }

    def registrar(self, nombre, correo, contrasenia, id_rol, id_tipo_documento, numero_identificacion):
        """
        Procesa el registro de un nuevo usuario.
        """
        # Validaciones
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

        # Verificar si el correo ya existe
        if self.auth.correo_existe(correo):
            return {
                "exito": False,
                "mensaje": "El correo electrónico ya está registrado"
            }

        # Intentar registrar
        if self.auth.registrar_usuario(nombre, correo, contrasenia, id_rol, id_tipo_documento, numero_identificacion):
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
        return self.auth.obtener_roles()

    def obtener_tipos_documento(self):
        """
        Obtiene todos los tipos de documento disponibles.
        """
        return self.auth.obtener_tipos_documento()