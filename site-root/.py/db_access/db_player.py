import cx_Oracle
from db_access import db_ops
from misc import timing
from model import player


player_cache = {}


@timing.timing
def get_by_id(player_id, skip_update=False):
    if player_id in player_cache:
        if not skip_update:
            update(player_cache[player_id])
        return player_cache[player_id]

    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from player m "
                   "where m.id = :user_id",
                   {"user_id": player_id})

    player_id, name, password, loadout_id, in_match, mmr, token, player_level = cursor.fetchone()
    cursor.close()

    result = player.Player(player_id, name, password, loadout_id, in_match, mmr, player_level, token)
    player_cache[player_id] = result
    return result


@timing.timing
def get_by_username(username):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select id from player m "
                   "where m.playername = :username",
                   {"username": username})

    player_id, = cursor.fetchone()
    cursor.close()

    return get_by_id(player_id)


def update(player_obj):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from player m "
                   "where m.id = :user_id",
                   {"user_id": player_obj.id})

    player_id, name, password, loadout_id, in_match, mmr, token, player_level = cursor.fetchone()
    cursor.close()

    player.name = name
    player.password = password
    player.loadout_id = loadout_id
    player.in_match = in_match
    player.mmr = mmr
    player.token = token
    player.player_level = player_level
