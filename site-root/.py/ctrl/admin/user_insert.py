import krait

def get_response(request):
	# insert logic using request.query["..."] (campuri setate din form)
	
	return krait.Response("HTTP/1.1", 302, ...) # TODO

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