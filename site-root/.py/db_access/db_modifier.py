import cx_Oracle
from db_access import db_ops
from model import modifier


def get_by_id(modifier_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from Modifier m "
                   "where m.id = :modifier_id",
                   {"modifier_id": modifier_id})

    modifier_id, name, max_hp, dmg, atk_range, move_range = cursor.fetchone()

    return modifier.Modifier(modifier_id, name, max_hp, dmg, atk_range, move_range)
