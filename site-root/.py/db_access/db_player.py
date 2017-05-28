import cx_Oracle
from db_access import db_ops
from model import player


def get_by_id(player_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from player m "
                   "where m.id = :user_id",
                   {"user_id": player_id})

    player_id, name, password, loadout_id, in_match, mmr, token, player_level = cursor.fetchone()
    cursor.close()

    return player.Player(player_id, name, password, loadout_id, in_match, mmr, player_level, token)


def get_by_username(username):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select id from player m "
                   "where m.playername = :username",
                   {"user_id": username})

    player_id, = cursor.fetchone()

    return get_by_id(player_id)
