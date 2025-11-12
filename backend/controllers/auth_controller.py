"""
Controlador de Autenticación (auth_controller.py)
-------------------------------------------------
Este módulo gestiona los procesos relacionados con la autenticación de usuarios
dentro de la aplicación. Actúa como intermediario entre las rutas HTTP (endpoints)
y el modelo `Auth`, encargado de interactuar directamente con la base de datos.

Funciones principales:
- Iniciar sesión verificando credenciales de usuario.
- Registrar nuevos usuarios.
- Consultar roles disponibles.
- Consultar tipos de documento existentes.
"""

from models.autenticacion import Auth
from utils.response import manejar_exito, manejar_error


class AuthController:
    """
    Controlador de autenticación.
    Contiene la lógica de negocio relacionada con el manejo de usuarios,
    autenticación, roles y tipos de documento.
    """

    def __init__(self):
        """
        Inicializa la instancia del modelo Auth, que agrupa
        las operaciones de autenticación y gestión de usuarios.
        """
        self.auth = Auth()

    # ============================================================
    # MÉTODO: LOGIN
    # ============================================================
    def login(self, correo, contrasenia):
        """
        Procesa el inicio de sesión del usuario.

        Args:
            correo (str): Correo electrónico del usuario.
            contrasenia (str): Contraseña ingresada.

        Returns:
            dict: Respuesta estructurada con éxito o error.
                  Incluye información del usuario si la autenticación es exitosa.
        """
        if not correo or not contrasenia:
            return manejar_error(Exception("Campos vacíos"), "Correo y contraseña son obligatorios")

        try:
            usuario = self.auth.verificar_credenciales(correo, contrasenia)
            if usuario is None:
                return manejar_error("Credenciales inválidas")
            return manejar_exito(usuario, "Inicio de sesión exitoso")
        except Exception as e:
            return manejar_error(e, "Correo o contraseña incorrectos")

    # ============================================================
    # MÉTODO: REGISTRAR USUARIO
    # ============================================================
    def registrar(self, nombre, correo, contrasenia, id_rol, id_tipo_documento, numero_identificacion):
        """
        Procesa el registro de un nuevo usuario en el sistema.

        Args:
            nombre (str): Nombre completo del usuario.
            correo (str): Correo electrónico del usuario.
            contrasenia (str): Contraseña del usuario.
            id_rol (int): Identificador del rol asignado.
            id_tipo_documento (int): Identificador del tipo de documento.
            numero_identificacion (str): Número del documento del usuario.

        Returns:
            dict: Resultado del proceso de registro, con mensaje y estado.
        """
        # Validación de campos requeridos
        if not nombre or not correo or not contrasenia or not id_rol or not id_tipo_documento or not numero_identificacion:
            return {
                "exito": False,
                "mensaje": "Todos los campos son obligatorios"
            }

        # Validar longitud mínima de contraseña
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

    # ============================================================
    # MÉTODO: OBTENER ROLES
    # ============================================================
    def obtener_roles(self):
        """
        Obtiene todos los roles disponibles en el sistema.

        Returns:
            dict: Contiene el estado de éxito y la lista de roles.
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

    # ============================================================
    # MÉTODO: OBTENER TIPOS DE DOCUMENTO
    # ============================================================
    def obtener_tipos_documento(self):
        """
        Obtiene todos los tipos de documento registrados en la base de datos.

        Returns:
            dict: Contiene el estado de éxito y la lista de tipos de documento.
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
