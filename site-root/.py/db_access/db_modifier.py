import cx_Oracle
from db_access import db_ops
from model import modifier


modifier_cache = {}


def get_by_id(modifier_id):
    if modifier_id in modifier_cache:
        # No update for this. This should be immutable, restart the server if you want to change it.
        return modifier_cache[modifier_id]

    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from Modifier m "
                   "where m.id = :modifier_id",
                   {"modifier_id": modifier_id})
    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        modifier_id, name, max_hp, dmg, atk_range, move_range, min_level = temp_data
    else:
        return None

    result = modifier.Modifier(modifier_id, name, max_hp, dmg, atk_range, move_range, min_level)
    modifier_cache[modifier_id] = result
    return result


def get_all():
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from Modifier m ")

    return [modifier.Modifier(modifier_id, name, max_hp, dmg, atk_range, move_range, min_level)
     for modifier_id, name, max_hp, dmg, atk_range, move_range, min_level in cursor]

