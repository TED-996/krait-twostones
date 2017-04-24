import os
import cx_Oracle
from exceptions import printException, printf

password = None


def get_connection():
    locations = [("127.0.0.1", 49161), ("127.0.0.1", 1521)]
    for location in locations:
        conn = get_connection_on_port(*location)
        if conn is not None:
            return conn

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


def read_store_password(site_root):
    global password
    password = get_password(site_root)


def get_password(site_root):
    with open(os.path.join(site_root, ".private", "oracle_password.nocommit.txt")) as file_obj:
        return file_obj.read()