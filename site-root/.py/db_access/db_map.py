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
    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        map_sourcefile, = temp_data
    else:
        return None
    return map_sourcefile


def get_by_id(map_id):
    return map.Map(map_id, get_sourcefile(map_id))
