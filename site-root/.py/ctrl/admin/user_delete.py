import krait
from db_access import db_ops

def get_response(request):
	user_id = request.get_post_form().get("id")
	if user_id is None:
		return krait.Response("HTTP/1.1", 400, {}, "<html><body><h1>400 Bad Request</h1></body></html>");

	db_conn = db_ops.get_connection()
	cursor = db_conn.cursor()
	cursor.execute("execute user_ops.deletePlayer(:player_id)", {"player_id": user_id})
	db_conn.commit()

	return krait.Response("HTTP/1.1", 302, {"Location": "admin/user_console"}, "")

def delete_player(conn, id):
	new_cursor = conn.cursor()
	try:
		new_cursor.execute("begin wegasAdmin.user_Ops.deletePlayer(:id); end;",
			{
				"id" : id
			}
		)
		conn.commit()
	except cx_Oracle.DatabaseError, exception:
		printf('Failed to delete player or player does not exist in wegasAdmin\n', )
		printException(exception)
		exit(1)