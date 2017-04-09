import krait

def get_response(request):
	# delete logic using request.query["..."] ("id" cel mai probabil)

	return krait.Response("HTTP/1.1", 302, ...) # TODO

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