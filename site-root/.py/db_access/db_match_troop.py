import cx_Oracle
from db_access import db_ops
from db_access import db_match
from db_access import db_troop
from model import match_troop
from misc import timing

mtroop_cache = {}

# TODO: moveReady si attackReady in MatchTroop (DB)


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

    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        match_troop_id, match_id, troop_id, x_axis, y_axis, hp, respawn_time = temp_data
    else:
        return None
    result = match_troop.MatchTroop(match_troop_id, match_id, troop_id, x_axis, y_axis, hp,
                                    respawn_time)

    mtroop_cache[match_troop_id] = result
    return result


def get_by_match(match_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select id from MatchTroop where matchId = :match_id",
                   {"match_id": match_id})

    temp_data = cursor.fetchall()
    cursor.close()
    return [get_by_id(m_id) for m_id, in temp_data]


def update(mtroop):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from MatchTroop where id = :mtroop_id",
                   {"mtroop_id": mtroop.id})

    temp_data = cursor.fetchone()
    cursor.close()
    if temp_data is not None:
        match_troop_id, match_id, troop_id, x_axis, y_axis, hp, respawn_time = temp_data
    else:
        return
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
        mtroop.troop = db_troop.get_by_id(mtroop.troop_id)
        mtroop.troop.populate()


def save(mtroop):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("update matchTroop set xAxis = :x, yAxis = :y, hp = :hp, respawnTime = :rp where id = :mtroop_id",
                   {"mtroop_id": mtroop.id,
                    "x": mtroop.x_axis,
                    "y": mtroop.y_axis,
                    "hp": mtroop.hp,
                    "rp": mtroop.respawn_time})
    cursor.close()
    conn.commit()
