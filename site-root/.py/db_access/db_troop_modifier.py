import cx_Oracle
from db_access import db_ops
from model import troop_modifier


def get_by_troop_id(troop_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from troop_modifier m "
                   "where m.id = :troop_id",
                   {"troop_id": troop_id})

    troop_id, modifier_id = cursor.fetchone()

    return troop_modifier.TroopModifier(troop_id, modifier_id)
