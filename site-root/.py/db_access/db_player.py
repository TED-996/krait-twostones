import cx_Oracle
from db_access import db_ops
from model import player


def get_by_id(player_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from player.py m "
                   "where m.id = :user_id",
                   {"user_id": player_id})

    player_id, name, password, loadout_id, in_match, mmr, player_level = cursor.fetchone()

    return player.Player(player_id, name, password, loadout_id, in_match, mmr, player_level)
