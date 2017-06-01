from db_access import db_ops
from model import queue


def get_by_id(player_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from queue "
                   "where playerId = :player_id",
                   {"player_id": player_id})

    player_id, time_started, priority, join_response, match_ready = cursor.fetchone()
    cursor.close()

    return queue.Queue(player_id, time_started, priority, join_response, match_ready)



def update(queue_obj):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from queue "
                   "where playerId = :player_id",
                   {"player_id": queue_obj.player_id})

    player_id, time_started, priority, join_response, match_ready = cursor.fetchone()
    queue_obj.time_started = time_started
    queue_obj.priority = priority
    queue_obj.join_response = join_response
    queue_obj.match_ready = match_ready


def save(queue_obj):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("update queue set "
                   "timeStarted = :time_started, "
                   "priority = :priority, "
                   "joinResponse = :join_response, "
                   "matchReady = :match_ready "
                   "where playerId = :player_id",
                   {
                       "player_id": queue_obj.player_id,
                       "time_started": queue_obj.time_started,
                       "priority": queue_obj.priority,
                       "join_response": queue_obj.join_response,
                       "match_ready": queue_obj.match_ready,
                   })
    cursor.close()
    conn.commit()


def insert(player_id, priority):
    conn = db_ops.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("Insert into queue "
                   "values(:player_id,  (SELECT SYSTIMESTAMP FROM DUAL), :priority, 0, 0)",
                   {"player_id": player_id, "priority": priority})
    conn.commit()
    cursor.close()
    
    return get_by_id(player_id)


def is_deleted(queue_obj):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select 'a' from queue where playerId = :player_id", {"player_id": queue_obj.player_id})
    exists = cursor.fetchone() is not None

    cursor.close()
    return not exists