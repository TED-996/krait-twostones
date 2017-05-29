import cx_Oracle
from db_access import db_ops
from db_access import db_match
from db_access import db_troop
from model import match_troop
from misc import timing

mtroop_cache = {}


@timing.timing
def get_by_id(match_troop_id, skip_update=False):
    if match_troop_id in mtroop_cache:
        if not skip_update:
            update(mtroop_cache[match_troop_id])
        return mtroop_cache[match_troop_id]

    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from MatchTroop where id = :mtroop_id",
                   {"mtroop_id": match_troop_id})

    match_troop_id, match_id, troop_id, x_axis, y_axis, hp, respawn_time = cursor.fetchone()
    result = match_troop.MatchTroop(match_troop_id, match_id, troop_id, x_axis, y_axis, hp,
                                    respawn_time)

    mtroop_cache[match_troop_id] = result
    return result


def update(mtroop):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from MatchTroop where id = :mtroop_id",
                   {"mtroop_id": mtroop.id})

    match_troop_id, match_id, troop_id, x_axis, y_axis, hp, respawn_time = cursor.fetchone()
    mtroop.match_id = match_id
    mtroop.x_axis = x_axis
    mtroop.y_axis = y_axis
    mtroop.hp = hp
    mtroop.respawn_time = respawn_time
    # Neither match_id nor troop_id have absolutely no business changing.


def populate(mtroop):
    if mtroop.match is None:
        mtroop.match = db_match.get_by_id(mtroop.match_id)
    if mtroop.troop is None:
        mtroop.troop = db_match.get_by_id(mtroop.troop_id)
