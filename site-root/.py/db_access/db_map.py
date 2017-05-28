import cx_Oracle
from db_access import db_ops

def get_sourcefile(map_id):
    conn = db_obs.get_connection()
    cursor = conn.cursor()

    cursor.execute("select m.sourceFile "
                   "from Map m "
                   "where m.id = :map_id",
                   {"map_id": map_id})
    
    map_sourcefile, = cursor.fetchone()

    return map_sourceFile