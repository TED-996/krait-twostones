import krait
import db_ops

def get_response(request):
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
