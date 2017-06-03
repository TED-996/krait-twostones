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

    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        player_id, name, password, loadout_id, in_match, mmr, token, player_level = temp_data
    else:
        return None

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

    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        player_id, = temp_data
    else:
        return None

    return get_by_id(player_id)


def update(player_obj):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from player m "
                   "where m.id = :user_id",
                   {"user_id": player_obj.id})

    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        player_id, name, password, loadout_id, in_match, mmr, token, player_level = temp_data
    else:
        return

    player.name = name
    player.password = password
    player.loadout_id = loadout_id
    player.in_match = in_match
    player.mmr = mmr
    player.token = token
    player.player_level = player_level


def save(player_obj):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("update player set "
                   "playername = :playername, "
                   "password = :password, "
                   "currentLoadout = :currentLoadout, "
                   "inMatch = :inMatch, "
                   "mmr = :mmr, "
                   "token = :token, "
                   "playerLevel = :playerLevel "
                   "where id = :playerId",
                   {
                       "playerId": player_obj.id,
                       "playername": player_obj.name,
                       "password": player_obj.password,
                       "currentLoadout": player_obj.loadout_id,
                       "inMatch": player_obj.in_match,
                       "mmr": player_obj.mmr,
                       "playerLevel": player_obj.player_level,
                       "token": player_obj.token
                   })

    cursor.close()
    conn.commit()
