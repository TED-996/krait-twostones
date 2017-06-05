import cx_Oracle
import logging

from db_access import db_ops, db_player
from model import match

match_cache = {}


def get_by_id(match_id, skip_update=False):
    if match_id in match_cache:
        if not skip_update:
            update(match_cache[match_id])
        return match_cache[match_id]

    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from Match m "
                   "where m.id = :match_id",
                   {"match_id": match_id})

    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        match_id, player1, player2, turn, turn_start_time, score1, score2, map_id, time_started = \
            temp_data
    else:
        return None

    result = match.Match(
        match_id,
        player1,
        player2,
        turn,
        turn_start_time,
        score1,
        score2,
        map_id,
        time_started)

    match_cache[match_id] = result
    return result


def get_by_player(player):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select id from Match m "
                   "where m.player1 = :player_id or m.player2 = :player_id",
                   {"player_id": player.id})

    result_tuple = cursor.fetchone()
    if result_tuple is None:
        return None
    else:
        match_id, = result_tuple
        return get_by_id(match_id)


def update(match_obj):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from Match m "
                   "where m.id = :match_id",
                   {"match_id": match_obj.id})

    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        match_id, player1, player2, turn, turn_start_time, score1, score2, map_id, time_started = \
            temp_data
    else:
        return

    match_obj.turn = turn
    match_obj.turn_start_time = turn_start_time
    match_obj.score1 = score1
    match_obj.score2 = score2
    match_obj.map_id = map_id
    match_obj.time_started = time_started


def create(player1, player2):
    conn = db_ops.get_connection()
    cursor = conn.cursor()
    cursor.execute("select matchidseq.nextval from dual")
    match_id, = cursor.fetchone()
    try:
        cursor.execute("insert into match values(:match_id,:id1,:id2,1,NULL,0,0,NULL,"
                       "(select systimestamp from dual))",
                       {"match_id": match_id, "id1": player1.player_id, "id2": player2.player_id})
    except ValueError as ex:
        logging.debug(ex.message)
    try:
        cursor.execute("insert into flag values (:match_id, 1, 3, 14, null)",
                       {"match_id": match_id})

        cursor.execute("insert into flag values (:match_id, 2, 60, 14, null)",
                       {"match_id": match_id})
    except ValueError as ex:
        logging.debug(ex.message)
    conn.commit()
    cursor.close()


def save(match):
    conn = db_ops.get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "update match set score1 = :s1, score2 = :s2, turn = :turn, turnStartTime = :turnTime where id = :match_id",
            {"s1": match.score1, "s2": match.score2, "turn": match.turn, "turnTime": match.turn_start_time,
             "match_id": match.id})
    except ValueError:
        logging.debug(ValueError.message)
        cursor.close()
        conn.commit()
    cursor.close()
    conn.commit()
