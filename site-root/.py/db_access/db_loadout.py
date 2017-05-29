import cx_Oracle
import logging

from db_access import db_ops
from db_access import db_player
from misc import timing
from model import loadout


loadout_cache = {}


@timing.timing
def get_by_id(loadout_id, skip_update=False):
    if loadout_id in loadout_cache:
        if not skip_update:
            update(loadout_cache[loadout_id])
        return loadout_cache[loadout_id]

    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from Loadout where id = :loadout_id",
                   {"loadout_id": loadout_id})

    loadout_id, player_id = cursor.fetchone()
    result = loadout.Loadout(loadout_id, player_id)

    loadout_cache[loadout_id] = result
    return result


@timing.timing
def update(loadout_obj):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from Loadout where id = :loadout_id",
                   {"loadout_id": loadout_obj.id})

    loadout_id, player_id = cursor.fetchone()

    if loadout_obj.player_id != player_id:
        loadout_obj.player_id = player_id
        if loadout_obj.player is not None:
            loadout_obj.player = db_player.get_by_id(loadout_obj.player_id)

    if loadout_obj.troops is not None:
        update_troops(loadout_obj)


@timing.timing
def check_owner(loadout_id, username):
    logging.debug("pre check owner")
    loadout_obj = get_by_id(loadout_id)
    owner = db_player.get_by_id(loadout_obj.player_id).name
    logging.debug("post check owner")
    return True

    # return loadout_obj.player.name == username


@timing.timing
def create(username):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    user_id = cursor.execute("select id from Player where playername = :username", {"username": username})
    return cursor.callfunc("loadout_ops.newLoadout", cursor.var(cx_Oracle.NUMBER), [user_id])


@timing.timing
def populate(loadout_obj):
    if loadout_obj.player is None:
        loadout_obj.player = False # idk man
        loadout_obj.player = db_player.get_by_id(loadout_obj.player_id)

    if loadout_obj.troops is None:
        loadout_obj.troops = []
        update_troops(loadout_obj)


@timing.timing
def update_troops(loadout_obj):
    logging.debug("update troops: pre import")
    from db_access import db_troop  # Unfortunately I have to do this here.
    logging.debug("update troops: post import")
    result = []
    for troop in db_troop.get_by_loadout_id(loadout_obj.id):
        result.append(troop)
        troop.populate()

    logging.debug("port update troops")
    loadout_obj.troops = result
