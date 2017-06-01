import websockets
import time
from db_access import db_ops
from db_access import db_player
from auth_utils import auth_tests
from db_access import db_queue
import logging


class QueueWaitController(websockets.WebsocketsCtrlBase):
    def __init__(self):
        super(QueueWaitController, self).__init__(True)
        self.priority = 1
        self.username = auth_tests.get_auth()
        self.player = db_player.get_by_username(self.username)

        self.join_sent = False
        self.queue_obj = None

        logging.debug("Constructed.")

    def on_thread_start(self):
        logging.debug("Started.")
        conn = db_ops.get_connection()
        cursor = conn.cursor()
        logging.debug("Player id " + str(self.player.id))
        try:
            cursor.execute("select playerid from queue where playerid = :player_id", {"player_id": self.player.id})
            if cursor.fetchone() is not None:
                self.push_out_message("already_in_queue")
            else:
                self.insert_in_queue()
        except ValueError:
            print ValueError.message

        logging.debug("pre while")
        while not self.should_stop():
            logging.debug("in loop ")
            in_msg = self.pop_in_message()

            if in_msg is not None:
                if in_msg == "exit_queue":
                    logging.debug(in_msg)
                    break
                if in_msg == "join":
                    self.save_join()

            if not self.join_sent and self.is_match_found():
                self.send_join()
                self.join_sent = True

            if self.is_removed():
                self.priority = 1
                self.insert_in_queue()

            time.sleep(0.5)

        cursor.execute("delete from queue where playerid = :player_id", {"player_id": self.player.id})
        conn.commit()
        cursor.close()
        logging.debug("Closing thread...")

    def insert_in_queue(self):
        self.queue_obj = db_queue.insert(self.player.id, self.priority)
        logging.debug("Inserted.")

    def is_match_found(self):
        db_queue.update(self.queue_obj)
        logging.debug("checking match ready: {}".format(self.queue_obj.match_ready))
        return self.queue_obj.match_ready

    def is_removed(self):
        logging.debug("checking is deleted")
        return db_queue.is_deleted(self.queue_obj)

    def send_join(self):
        logging.debug("sending join")
        self.push_out_message("match ready")

    def save_join(self):
        self.queue_obj.join_response = 1
        logging.debug("saving join")
        db_queue.save(self.queue_obj)
