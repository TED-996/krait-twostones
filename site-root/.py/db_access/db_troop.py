import cx_Oracle
from db_access import db_ops
from db_access import db_troop_class
from db_access import db_skin
from db_access import db_troop_modifier
from db_access import db_loadout
from db_access import db_modifier
from model import troop


troop_cache = {}


def get_by_id(troop_id):
    if troop_id in troop_cache:
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

    return result


def get_by_loadout_id(loadout_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select id from troop where loadoutId = :loadout_id",
                   {"loadout_id": loadout_id})

    ids = cursor.fetchall()
    return [get_by_id(i) for i, in ids]


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


def populate(troop_obj):
    print "populating troop: class",
    if troop_obj.troop_class is None:
        troop_obj.troop_class = db_troop_class.get_by_id(troop_obj.class_id)

    print ", skin",
    if troop_obj.skin is None:
        troop_obj.skin = db_skin.get_by_id(troop_obj.skin_id)

    print ", loadout",
    if troop_obj.loadout is None:
        troop_obj.loadout = db_loadout.get_by_id(troop_obj.loadout_id)
        troop_obj.loadout.populate()

    print ", modifiers"
    if troop_obj.modifiers is None:
        update_modifiers(troop_obj)

    print ", done"


def update_modifiers(troop_obj):
    result = []
    for troop_mod in db_troop_modifier.get_by_troop_id(troop_obj.id):
        result.append(db_modifier.get_by_id(troop_mod.modifier_id))

    result = result + [None] * (3 - len(result))
    troop_obj.modifiers = result
