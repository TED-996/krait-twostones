import cx_Oracle
from db_access import db_ops
from model import troop_modifier

def get_by_id(troop_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from troop_modifier m "
                   "where m.id = :troop_id",
                   {"troop_id": troop_id})

    troop_id, modifier_id = cursor.fetchone()

    troop_modifier = TroopModifier(troop_id, modifier_id)

    return troop_modifier
