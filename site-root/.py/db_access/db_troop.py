import cx_Oracle
from db_access import db_ops
from model import troop


def get_by_id(troop_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from troop m "
                   "where m.id = :troop_id",
                   {"troop_id": troop_id})

    troop_id, troop_class, skin_filename, modifiers, max_hp, dmg, atk_range, move_range = cursor.fetchone()

    return troop.Troop(troop_id, troop_class, skin_filename, modifiers, max_hp, dmg, atk_range, move_range)
