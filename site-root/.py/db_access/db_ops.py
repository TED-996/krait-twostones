import os
import cx_Oracle
import krait
from misc import timing

password = None


_conn = None
_conn_pid = None


_oracle_sid = "xe"
_oracle_dsn_tnss = [
    cx_Oracle.makedsn("127.0.0.1", 1521, _oracle_sid),
    cx_Oracle.makedsn("127.0.0.1", 49161, _oracle_sid)
]


@timing.timing
def get_connection():
    global _conn
    global _conn_pid

    if _conn is not None and _conn_pid == os.getpid():
        return _conn

    for dsn in _oracle_dsn_tnss:
        new_conn = get_connection_on_port(dsn)
        if new_conn is not None:
            _conn = new_conn
            _conn_pid = os.getpid()

            return new_conn

    raise RuntimeError("Could not connect to Oracle. Recover from that.")


def get_connection_on_port(dsn):
    global password

    username = "wegasAdmin"

    try:
        return cx_Oracle.connect(username, password, dsn)
    except cx_Oracle.DatabaseError:
        return None


def read_store_password():
    global password
    password = get_password()


def get_password():
    with open(os.path.join(krait.site_root, ".private", "oracle_password.nocommit.txt")) as file_obj:
        return file_obj.read()
