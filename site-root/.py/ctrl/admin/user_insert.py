import krait
from db_access import db_ops


def get_response(request):
	# insert logic using request.query["..."] (campuri setate din form)
	post_form = request.get_post_form()

	username = post_form.get("username")
	password = post_form.get("password")
	
	if username is None or password is None:		
		return krait.Response("HTTP/1.1", 400, {}, "<html><body><h1>400 Bad Request</h1></body></html>");
	
	redirect_url = "admin/user_console"
	try:
		db_conn = db_ops.get_connection();
		cursor = db_conn.cursor()
		cursor.execute("execute user_ops.addPlayer(:player_user, :player_pass)", {
			"player_user": username,
			"player_pass": password
		})
		db_conn.commit()
	except cx_Oracle.DatabaseError, exception:
		error_messages = ["Could not add user {}".format(username)]

	return krait.Response("HTTP/1.1", 302, {"Location": "admin/user_console"}, "")