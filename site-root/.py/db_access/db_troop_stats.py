import cx_Oracle
from db_access import db_ops
from db_access import db_troop
from model import troop_stats


troop_stats_cache = {}


def get_by_id(troop_id, skip_update=False):
    if troop_id in troop_stats_cache:
        if not skip_update:
            update(troop_stats_cache[troop_id])
        return troop_stats_cache[troop_id]

    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from TroopStatsCalculator where id = :troop_id",
                   {"troop_id": troop_id})
    troop_id, class_id, loadout_id, skin_id, max_hp, dmg, atk_range, move_range = cursor.fetchone()
    cursor.close()

    result = troop_stats.TroopStats(troop_id, class_id, loadout_id, skin_id,
                                    max_hp, dmg, atk_range, move_range)
    troop_stats_cache[troop_id] = result
    return result


def get_by_loadout_id(loadout_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select id from TroopStatsCalculator where loadoutId = :loadout_id",
                   {"loadout_id": loadout_id})
    ids = cursor.fetchall()
    cursor.close()

    return [get_by_id(i) for i, in ids]


def update(troop_stats_obj):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from TroopStatsCalculator where id = :troop_id",
                   {"troop_id": troop_stats_obj.troop_id})
    troop_id, class_id, loadout_id, skin_id, max_hp, dmg, atk_range, move_range = cursor.fetchone()
    cursor.close()

    if troop_stats_obj.troop is not None and \
            (troop_stats_obj.class_id, troop_stats_obj.loadout_id, troop_stats_obj.skin_id) !=\
            (class_id, loadout_id, skin_id):
        db_troop.update(troop_stats_obj.troop)
        troop_stats_obj.troop_class = troop_stats_obj.troop.troop_class
        troop_stats_obj.loadout = troop_stats_obj.troop.loadout
        troop_stats_obj.skin = troop_stats_obj.troop.skin

    troop_stats_obj.class_id = class_id
    troop_stats_obj.loadout_id = loadout_id
    troop_stats_obj.skin_id = skin_id
    troop_stats_obj.max_hp = max_hp
    troop_stats_obj.dmg = dmg
    troop_stats_obj.atk_range = atk_range
    troop_stats_obj.move_range = move_range


def populate(troop_stats_obj):
    if troop_stats_obj.troop is None:
        troop_stats_obj.troop = db_troop.get_by_id(troop_stats_obj.troop_id)
        troop_stats_obj.troop.populate()
        troop_stats_obj.troop_class = troop_stats_obj.troop.troop_class
        troop_stats_obj.loadout = troop_stats_obj.troop.loadout
        troop_stats_obj.skin = troop_stats_obj.troop.skin
