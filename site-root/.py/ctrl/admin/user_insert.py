import krait
import db_ops

def get_response(request):
	# insert logic using request.query["..."] (campuri setate din form)
	post_form = request.get_post_form()

	username = post_form.get("username")
	password = post_form.get("password")
	
	if username is None or password is None:		
		return krait.Response("HTTP/1.1", 400, {}, "<html><body><h1>400 Bad Request</h1></body></html>");

	db_conn = db_ops.get_connection();
	cursor = conn.cursor()
	cursor.execute("execute user_ops.addPlayer(:player_user, :player_pass", {
		"player_user": username,
		"player_pass": password
	})
	db_conn.commit()

	return krait.Response("HTTP/1.1", 302, {"Location": "admin/user_console"}, "")

def add_player(conn, name, password)
	new_cursor = conn.cursor()
	try:
		new_cursor.execute("begin wegasAdmin.USER_OPS.ADDPLAYER(:name, :pass); end;",
			{
				"name" : name, 
				"pass" : password
			}
		)
		conn.commit()
	except cx_Oracle.DatabaseError, exception:
		printf('Failed to add player to WEGAS\n')
		printException(exception)
		exit(1)