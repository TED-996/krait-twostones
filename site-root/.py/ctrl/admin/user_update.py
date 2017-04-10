import cx_Oracle
import urllib
import json
import krait
from db_access import db_ops

def get_response(request):
	# update logic using request.query["..."] (campuri setate din form)
	post_form = request.get_post_form()
	id = post_form.get("id")
	username = post_form.get("username")
	password = post_form.get("password")
	loadout = None
	in_match = None
	mmr = post_form.get("mmr")
	level = post_form.get("level")

	if id is None:
		return krait.Response("HTTP/1.1", 400, {}, "<html><body><h1>400 Bad Request</h1></body></html>");

	redirect_url = "/admin/user_console"
	try:
		db_conn = db_ops.get_connection();
		cursor = conn.cursor()
		cursor.execute("execute user_ops.updatePlayer(:player_id, :player_user, :player_pass, :player_loadout, :player_in_match, :player_mmr, :player_level", {
			"player_id": id,
			"player_user": username,
			"player_pass": password,
			"player_loadout": loadout,
			"player_in_match": in_match,
			"player_mmr": mmr,
			"player_level": level
		})
		db_conn.commit()
	except cx_Oracle.DatabaseError, exception:
		error_messages = ["Could not update user {}: {}".format(username, exception.args[0].message)]
		redirect_url += "?errors=" + urllib.quote_plus(json.dumps(error_messages))

	return krait.Response("HTTP/1.1", 302, {"Location": redirect_url}, "")
