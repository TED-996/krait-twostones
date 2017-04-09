import cx_Oracle
from exceptions import printException, printf
password = None


def get_connection():
	global password

	ip = "127.0.0.1"
	port = 49161
	username = "WegasAdmin"
	# global password
	sid = "xe"

	dsn_tns = cx_Oracle.makedsn(ip, port, sid)
	try
		cx_Oracle.connect(user, password, dsn_tns)	
	except cx_Oracle.DatabaseError, exception:
		printf('Failed to connect to %s\n', databaseName)
		printException(exception)
		exit(1)
	
def read_store_password(site_root):
	password = get_password(site_root)

def get_password(site_root):
	with open(os.path.join(site_root, ".private", "oracle_password.nocommit.txt")) as file_obj:
		return file_obj.read()
	