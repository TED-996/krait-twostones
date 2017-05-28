import cx_Oracle
from db_access import db_ops
from model import queue

def get_by_id(queue_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from queue m "
                   "where m.id = :queue_id",
                   {"queue_id": queue_id})

    queue_id, name, max_hp, dmg, atk_range, move_range = cursor.fetchone()

    queue = queue(queue_id, name, max_hp, dmg, atk_range, move_range)

    return queue
    
    

