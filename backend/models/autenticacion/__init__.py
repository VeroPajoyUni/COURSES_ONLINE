from .usuarios_autenticacion import UsuariosAutenticacion
from .roles import Roles
from .tipo_documentos import TipoDocumentos

class Auth(UsuariosAutenticacion, Roles, TipoDocumentos):
    """
    Clase que agrupa las funciones de autenticación, roles
    y tipos de documento sin alterar la compatibilidad existente.
    """
    def __init__(self):
        UsuariosAutenticacion.__init__(self)
        Roles.__init__(self)
        TipoDocumentos.__init__(self)
