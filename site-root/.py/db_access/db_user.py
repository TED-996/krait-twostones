import cx_Oracle
from db_access import db_ops
from model import user

def get_by_id(user_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from user m "
                   "where m.id = :user_id",
                   {"user_id": user_id})

    user_id, name, password, loadout_id, in_match, mmr, player_level = cursor.fetchone()

    user = User(user_id, name, password, loadout_id, in_match, mmr, player_level)

    return user
