import logging

from db_access import db_ops
from db_access import db_troop_class
from db_access import db_skin
from db_access import db_troop_modifier
from db_access import db_loadout
from db_access import db_modifier
from misc import timing
from model import troop


troop_cache = {}


@timing.timing
def get_by_id(troop_id, skip_update=False):
    if troop_id in troop_cache:
        if not skip_update:
            update(troop_cache[troop_id])
        return troop_cache[troop_id]

    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from troop m "
                   "where m.id = :troop_id",
                   {"troop_id": troop_id})

    troop_id, class_id, loadout_id, skin_id = cursor.fetchone()

    result = troop.Troop(troop_id, class_id, loadout_id, skin_id)
    troop_cache[troop_id] = result

    cursor.close()

    return result


@timing.timing
def get_by_loadout_id(loadout_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select id from troop where loadoutId = :loadout_id",
                   {"loadout_id": loadout_id})

    ids = cursor.fetchall()
    return [get_by_id(i) for i, in ids]


@timing.timing
def update(troop_obj):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from troop m "
                   "where m.id = :troop_id",
                   {"troop_id": troop_obj.id})

    troop_id, class_id, loadout_id, skin_id = cursor.fetchone()

    if troop_obj.class_id != class_id:
        troop_obj.class_id = class_id
        if troop_obj.troop_class is not None:
            troop_obj.troop_class = db_troop_class.get_by_id(class_id)

    if troop_obj.skin_id != skin_id:
        troop_obj.skin_id = skin_id
        if troop_obj.skin is not None:
            troop_obj.skin = db_skin.get_by_id(skin_id)

    if troop_obj.loadout_id != loadout_id:
        troop_obj.loadout_id = loadout_id
        if troop_obj.loadout is not None:
            troop_obj.loadout = db_loadout.get_by_id(loadout_id)


@timing.timing
def populate(troop_obj):
    logging.debug("populating troop: class")
    if troop_obj.troop_class is None:
        troop_obj.troop_class = db_troop_class.get_by_id(troop_obj.class_id)

    logging.debug(", skin")
    if troop_obj.skin is None:
        troop_obj.skin = db_skin.get_by_id(troop_obj.skin_id)

    logging.debug(", loadout")
    if troop_obj.loadout is None:
        troop_obj.loadout = db_loadout.get_by_id(troop_obj.loadout_id, skip_update=True)
        troop_obj.loadout.populate()

    logging.debug(", modifiers")
    if troop_obj.modifiers is None:
        update_modifiers(troop_obj)

    logging.debug(", done")


@timing.timing
def update_modifiers(troop_obj):
    result = []
    for troop_mod in db_troop_modifier.get_by_troop_id(troop_obj.id):
        result.append(db_modifier.get_by_id(troop_mod.modifier_id))

    result = result + [None] * (3 - len(result))
    troop_obj.modifiers = result


@timing.timing
def save(troop_obj, skip_refresh=False):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    print "loadout id in troop is", troop_obj.loadout_id

    logging.debug("pre update troop sql")
    cursor.execute("update Troop set "
                   "classId = :classId, "
                   "loadoutId = :loadoutId, "
                   "skinId = :skinId "
                   "where id = :troopId",
                   {
                       "troopId": troop_obj.id,
                       "classId": troop_obj.class_id,
                       "loadoutId": troop_obj.loadout_id,
                       "skinId": troop_obj.skin_id
                   })

    cursor.close()

    if troop_obj.modifiers is not None:
        db_troop_modifier.save(troop_obj, skip_refresh=True)

    conn.commit()
    if not skip_refresh:
        db_ops.refresh_troop_stats()

