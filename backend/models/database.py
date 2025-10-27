import mysql.connector
from mysql.connector import Error

class Database:
    def __init__(self):
        try:
            self.connection = mysql.connector.connect(
                host="localhost",
                user="root",
                password="",
                database="cursos_online"
            )
            self.cursor = self.connection.cursor(dictionary=True)
            print("Conexión a la base de datos exitosa.")
        except Error as e:
            print(f"Error al conectar: {e}")

    def ejecutar(self, consulta, parametros=None):
        """
        Ejecuta una consulta SQL. 
        Si es SELECT → no hace commit.
        Si es INSERT, UPDATE o DELETE → hace commit automáticamente.
        """
        self.cursor.execute(consulta, parametros or ())
        if consulta.strip().upper().startswith(("INSERT", "UPDATE", "DELETE")):
            self.connection.commit()
        return self.cursor

    def obtener_todos(self):
        return self.cursor.fetchall()

    def obtener_uno(self):
        return self.cursor.fetchone()
    
    def confirmar(self):
        """Confirma (commit) los cambios en la base de datos."""
        self.conn.commit()
        
    def cerrar(self):
        self.cursor.close()
        self.connection.close()