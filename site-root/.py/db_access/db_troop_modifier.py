import cx_Oracle
import logging

from db_access import db_ops
from db_access import db_modifier
from misc import timing
from model import troop_modifier
from model import modifier


def get_by_troop_id(troop_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from troopModifier m "
                   "where m.troopId = :troop_id",
                   {"troop_id": troop_id})

    items = cursor.fetchall()

    return [troop_modifier.TroopModifier(troop_id, modifier_id) for troop_id, modifier_id in items]


def get_modifiers_by_troop_id(troop_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select * from troopModifier m "
                   "where m.troopId = :troop_id",
                   {"troop_id": troop_id})

    items = cursor.fetchall()
    cursor.close()

    return [db_modifier.get_by_id(modifier_id) for _, modifier_id in items]


@timing.timing
def save(troop_obj, skip_refresh=False):
    if troop_obj.modifiers is None:
        return

    troop_id = troop_obj.id

    conn = db_ops.get_connection()
    cursor = conn.cursor()

    logging.debug("pre delete tm sql")
    cursor.execute("delete from troopModifier "
                   "where troopId = :troop_id",
                   {"troop_id": troop_id})

    logging.debug("pre insert loadout sql")
    cursor.executemany("insert into troopModifier "
                       "values(:troopId, :modId)",
                       [
                           {"troopId": troop_id, "modId": mod.id}
                           for mod in troop_obj.modifiers
                       ])

    cursor.close()
    conn.commit()
    if not skip_refresh:
        db_ops.refresh_troop_stats()