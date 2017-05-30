import cx_Oracle
from db_access import db_ops
from model import troop_modifier


def get_by_troop_id(troop_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from troopModifier m "
                   "where m.troopId = :troop_id",
                   {"troop_id": troop_id})

    items = cursor.fetchall()

    return [troop_modifier.TroopModifier(troop_id, modifier_id) for troop_id, modifier_id in items]


def save(troop_obj):
    if troop_obj.modifiers is None:
        return

    troop_id = troop_obj.id

    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("delete from troopModifier "
                   "where troop_id = :troop_id",
                   {"troop_id": troop_id})

    cursor.executemany("insert into troopModifier "
                       "values(:troopId, :modId)",
                       [
                           {"troopId": troop_id, "modId": mod.id}
                           for mod in troop_obj.modifiers
                       ])

    conn.commit()
    db_ops.refresh_troop_stats()