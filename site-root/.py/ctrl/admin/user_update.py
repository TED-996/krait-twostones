import krait

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

	return krait.Response("HTTP/1.1", 302, {"Location": "admin/user_console"}, "")
