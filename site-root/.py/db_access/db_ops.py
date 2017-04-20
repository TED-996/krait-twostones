import os
import cx_Oracle
from exceptions import printException, printf

password = None


def get_connection():
	global password

	ip = "127.0.0.1"
	port = 1521
	username = "WegasAdmin"
	# global password
	sid = "xe"

	dsn_tns = cx_Oracle.makedsn(ip, port, sid)
	try:
		return cx_Oracle.connect(username, password, dsn_tns)	
	except cx_Oracle.DatabaseError as exception:
		printf('Failed to connect to Oracle')
		raise
	

def read_store_password(site_root):
	global password
	password = get_password(site_root)
	
	
def get_password(site_root):
	with open(os.path.join(site_root, ".private", "oracle_password.nocommit.txt")) as file_obj:
		return file_obj.read()
	