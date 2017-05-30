import cx_Oracle
from db_access import db_ops
from model import skin


def get_by_id(skin_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from skin m "
                   "where m.id = :skin_id",
                   {"skin_id": skin_id})

    skin_id, class_id, filename = cursor.fetchone()

    return skin.Skin(skin_id, class_id, filename)

def get_all():
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from skin")

    return [skin.Skin(skin_id, class_id, filename) for skin_id, class_id, filename in  cursor]

@timing.timing
def get_by_filename(filename):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select id from skin s "
                   "where s.filename = :filename",
                   {"filename": filename})

    skin_id, = cursor.fetchone()

    return get_by_id(skin_id)