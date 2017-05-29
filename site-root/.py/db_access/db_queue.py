import cx_Oracle
from db_access import db_ops
from model import queue


def get_by_id(queue_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from queue m "
                   "where m.id = :queue_id",
                   {"queue_id": queue_id})

    player_id, time_started  = cursor.fetchone()

    return queue.Queue(player_id, time_started)
