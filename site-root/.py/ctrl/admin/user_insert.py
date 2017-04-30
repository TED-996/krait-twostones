import cx_Oracle
import urllib
import json
import krait
from db_access import db_ops


def get_response():
	# insert logic using request.query["..."] (campuri setate din form)
	post_form = krait.request.get_post_form()

	username = post_form.get("username")
	password = post_form.get("password")
	
	if username is None or password is None:		
		return krait.Response("HTTP/1.1", 400, {}, "<html><body><h1>400 Bad Request</h1></body></html>");
	
	redirect_url = "/admin/user_console"
	try:
		db_conn = db_ops.get_connection();
		cursor = db_conn.cursor()
		cursor.callproc("user_ops.addPlayer", [username, password])
		db_conn.commit()
	except cx_Oracle.DatabaseError, exception:
		error_messages = ["Could not add user {}: {}".format(username, exception.args[0].message)]
		redirect_url += "?errors=" + urllib.quote_plus(json.dumps(error_messages))

	return krait.Response("HTTP/1.1", 302, [("Location", redirect_url)], "")