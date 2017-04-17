from db_access import db_ops
import cx_Oracle


def get(loadout_id):
	conn = db_ops.get_connection()
	cursor = conn.cursor()

	cursor.execute("select player_id from Loadout where id = :loadout_id", {"loadout_id": loadout_id})
	owner_id = cursor.fetch() #todo: how write

	cursor.execute(
		"select id, classId, skinId"
		"from Troop"
		" where loadout_id = :loadout_id",
		{"loadout_id": loadout_id})
	troops = cursor.fetchall()

	troops_out = []
	for troop_id, class_id, skin_id in troops:
		