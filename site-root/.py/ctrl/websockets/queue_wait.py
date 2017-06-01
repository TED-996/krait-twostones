import websockets
from db_access import db_ops
from auth_utils import auth_tests

class QueueWaitController(websockets.WebsocketsCtrlBase):
    def __init__ (self):
        super(QueueWaitController, self).__init__(True)
        self.priority = 1;


    def on_thread_start(self):
        conn = db_ops.get_connection()
        cursor = conn.cursor()
        player_id = self.get_id_by_username(auth_tests.get_auth())
        try:
            cursor.execute("Insert into queue values(:player_id, \
                          (SELECT TO_CHAR(SYSTIMESTAMP, 'MM:SS') FROM DUAL), \
                          :priority), NULL, NULL", \
                           {"player_id": player_id,"priority": self.priority})
            cursor.close()
        except ValueError:
            print ValueError.message

    def get_id_by_username(self,username):
        conn = db_ops.get_connection()
        cursor = conn.cursor()

        cursor.execute("select id from player m "
                       "where m.playername = :username",
                       {"username": username})

        player_id = cursor.fetchone()
        cursor.close()
        return player_id
