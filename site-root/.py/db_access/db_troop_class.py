import cx_Oracle
from db_access import db_ops
from misc import timing
from model import troop_class
from misc import timing


troop_class_cache = {}


@timing.timing
def get_by_id(troop_class_id):
    if troop_class_id in troop_class_cache:
        return troop_class_cache[troop_class_id]

    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from troopClass m "
                   "where m.id = :troop_class_id",
                   {"troop_class_id": troop_class_id})

    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        troop_class_id, name, description, max_hp, dmg, atk_range, move_range, min_level = temp_data
    else:
        return None

    result = troop_class.TroopClass(
        troop_class_id, name, description, max_hp, dmg, atk_range, move_range, min_level)
    troop_class_cache[troop_class_id] = result
    return result

@timing.timing
def get_by_name(class_name):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select id from troopclass t "
                   "where t.name = :class_name",
                   {"class_name": class_name})

    class_id, = cursor.fetchone()
    cursor.close()

    return get_by_id(class_id)

@timing.timing
def get_all():
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from troopClass")

    return [
        troop_class.TroopClass(
            troop_class_id, name, description, max_hp, dmg, atk_range, move_range, min_level)
            for troop_class_id, name, description, max_hp, dmg, atk_range, move_range, min_level in cursor]
