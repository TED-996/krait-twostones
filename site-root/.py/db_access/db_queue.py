from db_access import db_ops
from model import queue


def get_by_id(player_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from queue "
                   "where playerId = :player_id",
                   {"player_id": player_id})
    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        player_id, time_started, priority, join_response, match_ready = temp_data
    else:
        return None


    return queue.Queue(player_id, time_started, priority, join_response, match_ready)



def update(queue_obj):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("select * from queue "
                       "where playerId = :player_id",
                       {"player_id": queue_obj.player_id})
        cursor_object = cursor.fetchone()
        if cursor_object is None:
            raise ValueError("Object not in table")
        else:
            player_id, time_started, priority, join_response, match_ready = cursor_object
            queue_obj.time_started = time_started
            queue_obj.priority = priority
            queue_obj.join_response = join_response
            queue_obj.match_ready = match_ready
    except ValueError:
        raise ValueError("Object not in table")


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

def get_players(number_of_players):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select playerid from (select playerid from queue where matchready = 0 order by priority) where rownum < :number_of_players + 1 ",{"number_of_players": number_of_players});
    player_ids = cursor.fetchall()
    player_queue = []
    for i, in player_ids:
        player_queue.append(get_by_id(i))
    cursor.close()
    return player_queue


def delete_long_waits():
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("delete from queue "
                   "where current_timestamp - timeStarted > interval '60' second "
                   "and matchReady = 0")

    cursor.close()
    conn.commit()
