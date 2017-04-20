import cx_Oracle
from db_access import db_ops


def get(loadout_id):
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    cursor.execute("select p.playername "
                   "from Loadout l"
                   "    join Player p on (p.id = l.playerId) "
                   "where l.id = :loadout_id",
                   {"loadout_id": loadout_id})
    owner_username = cursor.fetch()  # TODO: how write

    cursor.execute(
        "select t.id, s.filename, tc.name, tc.description, t.maxHp, t.dmg, t.atkRange, t.moveRange "
        "from Troop t "
        "   join Skin s on (t.skinId = s.id) "
        "where t.loadout_id = :loadout_id",
        {"loadout_id": loadout_id})
    troops = cursor.fetchall()

    troops_out = []
    for troop_tuple in troops:
        troop_id, skin_fn, class_name, class_desc, hp, dmg, a_range, m_range = troop_tuple

        if hp == -1 or dmg == -1 or a_range == -1 or m_range == -1:
            cursor.callproc("loadout_ops.compute_stats", [troop_id])
            cursor.execute(
                "select maxHp, dmg, atkRange, moveRange "
                "from Troop "
                "where id = :troop_id",
                {"troop_id": troop_id})
            hp, dmg, a_range, m_range = cursor.fetch()

        cursor.execute("select modifierId from troopModifier where troopId = :troop_id", {"troop_id": troop_id})
        modifiers = cursor.fetchall()

        troop_dict = {
            "id": troop_id,
            "skin": skin_fn,
            "className": class_name,
            "description": class_desc,
            "hp": hp,
            "dmg": dmg,
            "aRange": a_range,
            "mRange": m_range,
            "modifiers": modifiers
        }
        troops_out.append(troop_dict)

    conn.close()

    return {
        "owner": owner_username,
        "loadoutId": loadout_id,
        "troops": troops_out
    }


def check_owner(loadout_id, username):
    return True  # TODO: TMP TMP TMP


def create(username):
    # TODO: create SQL
    conn = db_ops.get_connection()
    cursor = conn.cursor()

    user_id = cursor.execute("select id from Player where playername = :username", {"username": username})
    return cursor.callfunc("loadout_ops.newLoadout", cursor.var(cx_Oracle.NUMBER), [user_id])
