import cx_Oracle
from db_access import db_ops
from model import map

def get_sourcefile(map_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select m.sourceFile "
                   "from Map m "
                   "where m.id = :map_id",
                   {"map_id": map_id})
    
    map_sourcefile, = cursor.fetchone()

    return map_sourcefile

def get_by_id(map_id):
    return map.Map(map_id, get_sourcefile(map_id))
