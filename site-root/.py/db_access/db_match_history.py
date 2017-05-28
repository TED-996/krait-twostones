import cx_Oracle
from db_access import db_ops
from model import match_history


def get_by_id(match_history_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from MatchHistory m "
                   "where m.matchHistoryId = match_history_id",
                   {"match_history_id": match_history_id})
    
    matchHistoryId, player1ID, player2ID, score1, score2, mapId, matchStart , duration, = cursor.fetchone()
    
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
    
    first_player, = cursor.fetchone()

    cursor.execute("select m.player2ID "
                   "from MatchHistory m "
                   "where m.matchHistoryId = match_history_id",
                   {"match_history_id": match_history_id})
    
    second_player, = cursor.fetchone()

    return [first_player, second_player]


def get_score(match_history_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select m.score1 "
                   "from MatchHistory m "
                   "where m.matchHistoryId = match_history_id",
                   {"match_history_id": match_history_id})
    
    first_score, = cursor.fetchone()

    cursor.execute("select m.score2 "
                   "from MatchHistory m "
                   "where m.matchHistoryId = match_history_id",
                   {"match_history_id": match_history_id})
    
    second_score, = cursor.fetchone()

    return [first_score, second_score]


def get_map(match_history_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select m.mapId "
                   "from MatchHistory m "
                   "where m.matchHistoryId = match_history_id",
                   {"match_history_id": match_history_id})

    map_id, = cursor.fetchone()

    return map_id

def get_match_start(match_history_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select m.matchStart "
                   "from MatchHistory m "
                   "where m.matchHistoryId = match_history_id",
                   {"match_history_id": match_history_id})

    match_start, = cursor.fetchone()

    return match_start

def get_match_duration(match_history_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select m.duration "
                   "from MatchHistory m "
                   "where m.matchHistoryId = match_history_id",
                   {"match_history_id": match_history_id})

    match_duration, = cursor.fetchone()

    return match_duration
