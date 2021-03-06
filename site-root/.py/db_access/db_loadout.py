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

    cursor.execute("select id, playerid, name from loadout where id = :loadout_id", {"loadout_id": loadout_id})

    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        loadout_id, player_id, name = temp_data
    else:
        return None
    result = loadout.Loadout(loadout_id, player_id, name)

    loadout_cache[loadout_id] = result
    return result

@timing.timing
def get_all_by_id(user_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select id from Loadout where playerId = :userId",
                   {"userId": user_id})
    
    loadout_ids = cursor.fetchall()

    result = []
    for loadout_id, in loadout_ids:
        # logging.debug(loadout_id)
        result.append(get_by_id(loadout_id))

    return result


@timing.timing
def update(loadout_obj):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select id,playerid,name from Loadout where id = :loadout_id",
                   {"loadout_id": loadout_obj.id})

    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        loadout_id, player_id, name = temp_data
    else:
        return

    if loadout_obj.player_id != player_id:
        loadout_obj.player_id = player_id
        if loadout_obj.player is not None:
            loadout_obj.player = db_player.get_by_id(loadout_obj.player_id)

    if loadout_obj.troops is not None:
        update_troops(loadout_obj)


@timing.timing
def check_owner(loadout_id, username):
    # logging.debug("pre check owner")
    loadout_obj = get_by_id(loadout_id)
    owner = db_player.get_by_id(loadout_obj.player_id).name
    # logging.debug("post check owner")
    return True

    # return loadout_obj.player.name == username


@timing.timing
def create(username):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select id from Player where playername = :username", {"username": username})
    temp_data = cursor.fetchone()
    if temp_data is not None:
        user_id, = temp_data
    else:
        return -1
    return create_new_loadout(user_id)

@timing.timing
def create_new_loadout(player_id):
    logging.debug(player_id)
    db_conn = db_ops.get_connection()
    cursor = db_conn.cursor()
    cursor.execute("select loadoutidseq.nextval from dual")
    loadout_id, = cursor.fetchone()
    cursor.execute("insert into loadout values(:loadout_id,'Temp Loadout',:id)",
                   {"loadout_id": loadout_id, "id": player_id})
    db_conn.commit()
    logging.debug("created loadout " + str(loadout_id))
    class_ids = [1, 2, 3, 4, 3, 2]
    cursor.executemany("insert into troop values(troopidseq.nextval,:class_id,:loadout_id,:skin_id)",
                       [{
                           "loadout_id": loadout_id,
                           "class_id": c_id,
                           "skin_id": c_id
                       } for c_id in class_ids])
    logging.debug("committing")
    cursor.close()
    db_conn.commit()
    logging.debug("finished")
    return loadout_id

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
    # logging.debug("update troops: pre import")
    from db_access import db_troop  # Unfortunately I have to do this here.
    # logging.debug("update troops: post import")
    result = []
    for troop in db_troop.get_by_loadout_id(loadout_obj.id):
        result.append(troop)
        troop.populate()

    # logging.debug("port update troops")
    loadout_obj.troops = result

@timing.timing
def update_name(loadout_obj, new_loadout_name):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    # logging.debug("pre update loadout name sql")

    logging.debug(loadout_obj.id)
    logging.debug(new_loadout_name)

    cursor.execute("update Loadout set name = :name where id = :loadoutId ",
                   {"loadoutId": loadout_obj.id, "name": new_loadout_name})
    cursor.close()
    conn.commit()
    
                
@timing.timing
def save(loadout_obj):
    from db_access import db_troop

    conn = db_ops.get_connection()
    cursor = conn.cursor()

    # logging.debug("pre update loadout sql")
    cursor.execute("update Loadout set "
                   "playerId = :playerId "
                   "where id = :loadoutId",
                   {
                       "loadoutId": loadout_obj.id,
                       "playerId": loadout_obj.player_id
                   })

    cursor.close()
    if loadout_obj.troops is not None:
        for troop in loadout_obj.troops:
            print "saving troop", troop.id
            db_troop.save(troop, skip_refresh=True)

    conn.commit()
    db_ops.refresh_troop_stats()

