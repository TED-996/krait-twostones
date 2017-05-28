import cx_Oracle
from db_access import db_ops
from model import troop_class


def get_by_id(troop_class_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from troopClass m "
                   "where m.id = :troop_class_id",
                   {"troop_class_id": troop_class_id})

    troop_class_id, name, description, max_hp, dmg, atk_range, move_range, min_level = cursor.fetchone()

    return troop_class.TroopClass(
        troop_class_id, name, description, max_hp, dmg, atk_range, move_range, min_level)


def get_all():
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from troopClass")

    return [
        troop_class.TroopClass(
            troop_class_id, name, description, max_hp, dmg, atk_range, move_range, min_level)
            for troop_class_id, name, description, max_hp, dmg, atk_range, move_range, min_level in cursor]

