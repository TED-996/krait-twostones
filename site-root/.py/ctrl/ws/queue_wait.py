import websockets
import time
from db_access import db_ops
from auth_utils import auth_tests
import sys
import logging


class QueueWaitController(websockets.WebsocketsCtrlBase):
    def __init__(self):
        super(QueueWaitController, self).__init__(True)
        self.priority = 1
        self.player_id = 0;

    def on_thread_start(self):
        conn = db_ops.get_connection()
        cursor = conn.cursor()
        self.player_id, = self.get_id_by_username(auth_tests.get_auth())
        logging.debug("-------------------------Player id " + str(self.player_id))
        try:
            cursor.execute("Insert into queue values(:player_id,  (SELECT SYSTIMESTAMP FROM DUAL), :priority, NULL, NULL)", {"player_id": self.player_id, "priority": self.priority})
            conn.commit()
        except ValueError:
            print ValueError.message
        sys.stdout.flush()

        while not self.should_stop():
            logging.debug("in loop ")
            in_msg = self.pop_in_message()

            if in_msg is not None and in_msg == "exit queue":
                logging.debug(in_msg)
                cursor.execute("delete from queue where playerid = :player_id", {"player_id": self.player_id})
                conn.commit()
            sys.stdout.flush()
            time.sleep(0.5)

        cursor.execute("delete from queue where playerid = :player_id", {"player_id": self.player_id})
        conn.commit()
        cursor.close()
        sys.stdout.flush()

    def get_id_by_username(self, username):
        conn = db_ops.get_connection()
        cursor = conn.cursor()

        cursor.execute("select id from player m "
                       "where m.playername = :username",
                       {"username": username})

        player_id = cursor.fetchone()
        cursor.close()
        return player_id
