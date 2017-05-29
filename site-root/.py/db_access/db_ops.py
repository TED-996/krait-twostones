import os
import cx_Oracle
import krait
from misc import timing

password = None


conn = None
conn_pid = None


@timing.timing
def get_connection():
    global conn
    global conn_pid

    if conn is not None and conn_pid == os.getpid():
        return conn

    locations = [("127.0.0.1", 49161), ("127.0.0.1", 1521)]
    for location in locations:
        new_conn = get_connection_on_port(*location)
        if new_conn is not None:
            conn = new_conn
            conn_pid = os.getpid()
            
            return new_conn

    raise RuntimeError("Could not connect to Oracle. Recover from that.")


def get_connection_on_port(ip, port):
    global password

    username = "wegasAdmin"
    # global password
    sid = "xe"

    dsn_tns = cx_Oracle.makedsn(ip, port, sid)
    try:
        return cx_Oracle.connect(username, password, dsn_tns)
    except cx_Oracle.DatabaseError:
        return None


def read_store_password():
    global password
    password = get_password()


def get_password():
    with open(os.path.join(krait.site_root, ".private", "oracle_password.nocommit.txt")) as file_obj:
        return file_obj.read()