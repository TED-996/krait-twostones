import cx_Oracle
import urllib
import json
import krait
from db_access import db_ops

def get_response(request):
	user_id = request.get_post_form().get("id")
	if user_id is None:
		return krait.Response("HTTP/1.1", 400, [], "<html><body><h1>400 Bad Request</h1></body></html>");
	
	redirect_url = "/admin/user_console"
	try:
		db_conn = db_ops.get_connection()
		cursor = db_conn.cursor()
		cursor.callproc("user_ops.deletePlayer", [user_id])
		db_conn.commit()
	except cx_Oracle.DatabaseError, exception:
		error_messages = ["Could not delete user {}: {}".format(user_id, exception.args[0].message)]
		redirect_url += "?errors=" + urllib.quote_plus(json.dumps(error_messages))


	return krait.Response("HTTP/1.1", 302, [("Location", redirect_url)], "")