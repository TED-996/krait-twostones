from db_access import db_queue, db_match
import websockets
import logging
import time


class MatchmakerController(websockets.WebsocketsCtrlBase):
    def __init__(self):
        super(MatchmakerController, self).__init__(True)
        self.player_ids = []
        self.matches = []

        logging.debug("MatchmakerController ----- Constructed.")

    def on_thread_start(self):
        logging.debug("MatchmakerController ----- Thread started")

        while not self.should_stop():
            self.player_ids = db_queue.get_players(2)
            if len(self.player_ids) >= 2:
                logging.debug("-------------Players: " + str(self.player_ids))
                temp_match = []
                for i in self.player_ids:
                    i.match_ready = 1
                    db_queue.save(i)
                    temp_match.append(i)
                self.matches.append(temp_match)

            if len(self.matches) > 0:
                for match in self.matches:
                    if self.if_match_accepted(match[0], match[1]) == 2:
                        db_match.save(match[0], match[1])
                        self.matches.remove([match[0], match[1]])

            time.sleep(0.5)

        logging.debug("MatchmakerController ----- Closing thread")

    def if_match_accepted(self, match1, match2):
        try:
            db_queue.update(match1)
            db_queue.update(match2)
            logging.debug("----------------------------checking join response: {}".format(match1.match_ready))
            logging.debug("----------------------------checking join response: {}".format(match2.match_ready))
            return match1.join_response + match2.join_response
        except ValueError:
            logging.debug(ValueError.message)
            self.matches.remove([match1, match2])
            return 0