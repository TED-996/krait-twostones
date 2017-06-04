import websockets
import time
from db_access import db_match
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
        self.match_accepted = False
        self.time_since_request_sent = 0

        logging.debug("Constructed.")

    def on_thread_start(self):
        logging.debug("Started.")
        conn = db_ops.get_connection()
        cursor = conn.cursor()
        logging.debug("Player id " + str(self.player.id))
        try:
            cursor.execute("select count(playerid) from queue where playerid = :player_id", {"player_id": self.player.id})
            temp_data = cursor.fetchone()
            if temp_data is not None:
                count_player, = temp_data
            else:
                count_player = 0
            logging.debug(count_player)
            if count_player > 0:
                logging.debug("-----------------------------------already in queue")
                self.push_out_message("already_in_queue")
            else:
                logging.debug("-----------------------------------else branch")
                self.insert_in_queue()
        except ValueError:
            logging.debug("Got an error...")
            print ValueError.message

        logging.debug("pre while")
        while not self.should_stop():
            logging.debug("in loop ")
            in_msg = self.pop_in_message()

            if in_msg is not None:
                logging.debug(in_msg)
                if in_msg == "exit_queue":
                    logging.debug(in_msg)
                    break
                if in_msg == "accept_match":
                    self.save_join()
                    self.match_accepted = True

                if in_msg == "deny_match":
                    cursor.execute("delete from queue where playerid = :player_id", {"player_id": self.player.id})
                    conn.commit()
                    break

            if not self.join_sent and self.is_match_found():
                self.send_join()
                self.join_sent = True
                self.time_since_request_sent = time.time()

            if self.join_sent and time.time() - self.time_since_request_sent > 30:
                if self.match_accepted is False:
                    cursor.execute("delete from queue where playerid = :player_id", {"player_id": self.player.id})
                    conn.commit()
                    self.push_out_message("removed_from_queue")
                    break
                else:
                    logging.debug("Other player declined.")
                    self.leave_join()
                    self.push_out_message("return_to_queue")
                    self.join_sent = False
                    self.match_accepted = False
                    self.time_since_request_sent = 0

            if self.match_accepted and self.if_in_match() is not False:
                self.push_out_message("match_ok")
                break

            if self.is_removed():
                self.priority += 1
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
        self.push_out_message("match_ready")

    def save_join(self):
        self.queue_obj.join_response = 1
        logging.debug("saving join")
        db_queue.save(self.queue_obj)

    def leave_join(self):
        self.queue_obj.join_response = 0
        self.queue_obj.match_ready = 0
        logging.debug("saving join")
        db_queue.save(self.queue_obj)

    def if_in_match(self):
        match_id = db_match.get_by_player(self.player)
        if match_id is not None:
            return match_id
        else:
            return False

