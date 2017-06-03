import cx_Oracle
from db_access import db_ops
from model import match_history


def get_by_id(match_history_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from MatchHistory m "
                   "where m.matchHistoryId = match_history_id",
                   {"match_history_id": match_history_id})

    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        matchHistoryId, player1ID, player2ID, score1, score2, mapId, matchStart , duration, = temp_data
    else:
        return None
    
    return match_history.MatchHistory(matchHistoryId,
                                      player1ID,
                                      player2ID,
                                      score1,
                                      score2,
                                      mapId,
                                      matchStart,
                                      duration)


def get_players(match_history_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select m.player1ID "
                   "from MatchHistory m "
                   "where m.matchHistoryId = match_history_id",
                   {"match_history_id": match_history_id})

    temp_data = cursor.fetchone()
    if temp_data is not None:
        first_player, = temp_data
    else:
        first_player = None

    cursor.execute("select m.player2ID "
                   "from MatchHistory m "
                   "where m.matchHistoryId = match_history_id",
                   {"match_history_id": match_history_id})

    temp_data = cursor.fetchone()
    if temp_data is not None:
        second_player, = temp_data
    else:
        second_player = None
    cursor.close()

    return [first_player, second_player]


def get_score(match_history_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select m.score1 "
                   "from MatchHistory m "
                   "where m.matchHistoryId = match_history_id",
                   {"match_history_id": match_history_id})
    temp_data = cursor.fetchone()
    if temp_data is not None:
        first_score, = temp_data
    else:
        first_score = None

    cursor.execute("select m.score2 "
                   "from MatchHistory m "
                   "where m.matchHistoryId = match_history_id",
                   {"match_history_id": match_history_id})

    temp_data = cursor.fetchone()
    if temp_data is not None:
        second_score, = temp_data
    else:
        second_score = None

    cursor.close()

    return [first_score, second_score]


def get_map(match_history_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select m.mapId "
                   "from MatchHistory m "
                   "where m.matchHistoryId = match_history_id",
                   {"match_history_id": match_history_id})

    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        map_id, = temp_data
    else:
        return None

    return map_id

def get_match_start(match_history_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select m.matchStart "
                   "from MatchHistory m "
                   "where m.matchHistoryId = match_history_id",
                   {"match_history_id": match_history_id})
    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        match_start, = temp_data
    else:
        return None

    return match_start

def get_match_duration(match_history_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select m.duration "
                   "from MatchHistory m "
                   "where m.matchHistoryId = match_history_id",
                   {"match_history_id": match_history_id})

    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        match_duration, = temp_data

    return match_duration
