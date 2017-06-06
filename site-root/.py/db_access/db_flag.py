from db_access import db_ops
from db_access import db_match_troop
from model import flag



def get_by_match(match_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from flag where matchId = :match_id",
                   {"match_id": match_id})
    results = []
    for match_id, flag_idx, x_axis, y_axis, carrying_troop_id in cursor:
        results.append(flag.Flag(match_id, flag_idx, x_axis, y_axis, carrying_troop_id))

    cursor.close()
    return results

def populate(flag_obj):
    flag_obj.carrying_troop = None if flag_obj.carrying_troop_id is None \
                                    else db_match_troop.get_by_id(flag_obj.carrying_troop_id)


def update(flag_obj):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from flag where matchId = :match_id and flagIdx = :flag_idx",
                   {"match_id": flag_obj.match_id, "flag_idx": flag_obj.flag_idx})

    try:
        match_id, flag_idx, x_axis, y_axis, carrying_troop_id = cursor.fetchone()
    except ValueError:
        raise ValueError("Object not in table.")
    cursor.close()

    flag_obj.x_axis = x_axis
    flag_obj.y_axis = y_axis
    if carrying_troop_id != flag_obj.carrying_troop_id:
        flag_obj.carrying_troop_id = carrying_troop_id
        populate(flag_obj)


def save(flag_obj):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("update flag set "
                   "xAxis = :x_axis, "
                   "yAxis = :y_axis, "
                   "carryingTroop = :carrying_troop_id "
                   "where matchId = :match_id and flagIdx = :flag_idx",
                   {
                       "match_id": flag_obj.match_id,
                       "flag_idx": flag_obj.flag_idx,
                       "x_axis": flag_obj.x_axis,
                       "y_axis": flag_obj.y_axis,
                       "carrying_troop_id": flag_obj.carrying_troop_id
                   })
    cursor.close()
    conn.commit()