import websockets
import time
from db_access import db_ops
from auth_utils import auth_tests
import sys


class QueueWaitController(websockets.WebsocketsCtrlBase):
    def __init__(self):
        super(QueueWaitController, self).__init__(True)
        self.priority = 1
        self.time_started = 0
        print "INIT QueueWaitController"

    def on_thread_start(self):
        conn = db_ops.get_connection()
        cursor = conn.cursor()
        player_id = self.get_id_by_username(auth_tests.get_auth())
        player_id = 1
        print 'PlayerId ', player_id
        try:
            cursor.execute("Insert into queue values(:player_id,  (SELECT SYSTIMESTAMP FROM DUAL), :priority, NULL, NULL)", {"player_id": player_id, "priority": self.priority})
            cursor.close()
            conn.commit()
            print 'Insert done!'
            print 'PlayerId ', player_id
            self.time_started = time.clock()
        except ValueError:
            print ValueError.message

        sys.stdout.flush()

        while not self.should_stop():
            print "in loop"
            sys.stdout.flush()
            time.sleep(1)

    def get_id_by_username(self, username):
        conn = db_ops.get_connection()
        cursor = conn.cursor()

        cursor.execute("select id from player m "
                       "where m.playername = :username",
                       {"username": username})

        player_id = cursor.fetchone()
        cursor.close()
        return player_id
