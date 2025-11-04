def manejar_exito(data=None, mensaje="Operación realizada correctamente"):
    return {"exito": True, "data": data or [], "mensaje": mensaje}

def manejar_error(e, mensaje="Error interno del servidor"):
    print(f"[ERROR] {mensaje}: {e}")
    return {"exito": False, "data": [], "mensaje": str(e)}

def manejar_accion_exitosa(mensaje):
    return {"exito": True, "mensaje": mensaje}
