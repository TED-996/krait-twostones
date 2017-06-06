from db_access import db_queue, db_match
import websockets
import logging
import time


class MatchmakerController(websockets.WebsocketsCtrlBase):
    def __init__(self):
        super(MatchmakerController, self).__init__(True)
        self.players = []
        self.matches = []

        logging.debug("MatchmakerController ----- Constructed.")

    def on_thread_start(self):
        logging.debug("MatchmakerController ----- Thread started")

        self.clear_matches()

        while not self.should_stop():
            self.players = db_queue.get_players(2)
            if len(self.players) >= 2:
                logging.debug("-------------Players: " + str(self.players))
                temp_match = []
                for player in self.players:
                    player.match_ready = 1
                    db_queue.save(player)
                    temp_match.append(player)
                self.matches.append(temp_match)

            if len(self.matches) > 0:
                for match in self.matches[:]:
                    if self.if_match_accepted(match[0], match[1]) == 2:
                        db_match.create(match[0], match[1])
                        self.matches.remove(match)

            time.sleep(0.5)

        logging.debug("MatchmakerController ----- Closing thread")

    def if_match_accepted(self, match1, match2):
        try:
            db_queue.update(match1)
            db_queue.update(match2)
            logging.debug("----------------------------checking join response 1: {}".format(match1.match_ready))
            logging.debug("----------------------------checking join response 2: {}".format(match2.match_ready))
            return match1.join_response + match2.join_response
        except ValueError as ex:
            logging.debug(ex)
            self.matches.remove([match1, match2])
            return 0

    def clear_matches(self):
        db_queue.delete_long_waits()
