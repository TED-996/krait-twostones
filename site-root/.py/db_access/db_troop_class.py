import cx_Oracle
from db_access import db_ops
from model import troop_class

def get_by_id(troop_class_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from troop_class m "
                   "where m.id = :troop_class_id",
                   {"troop_class_id": troop_class_id})

    troop_class_id, name, descriptin, max_hp, dmg, atk_range, move_range = cursor.fetchone()

    troop_class = troop_class(troop_class_id, name, max_hp, dmg, atk_range, move_range)

    return troop_class
    
    

