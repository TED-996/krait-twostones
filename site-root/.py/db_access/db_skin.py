import cx_Oracle
from db_access import db_ops
from model import skin

def get_by_id(skin_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from skin m "
                   "where m.id = :skin_id",
                   {"skin_id": skin_id})

    skin_id, class_id, filename = cursor.fetchone()

    skin = Skin(skin_id, class_id, filename)

    return skin
    
    

