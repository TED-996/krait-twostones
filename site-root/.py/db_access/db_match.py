import cx_Oracle
from db_access import db_ops
from model import match


def get_by_id(match_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from Match m "
                   "where m.id = :match_id",
                   {"match_id": match_id})

    match_id, player1, player2, turn, turn_start_time, score1, score2, map_id, time_started =\
        cursor.fetchone()

    return match.Match(
        match_id,
        player1,
        player2,
        turn,
        turn_start_time,
        score1,
        score2,
        map_id,
        time_started)


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
