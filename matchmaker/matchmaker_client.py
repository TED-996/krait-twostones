import time
import logging
from ws4py.client.threadedclient import WebSocketClient


logging.basicConfig(level=logging.INFO)


class MatchmakerClient(WebSocketClient):
    def __init__(self):
        super(MatchmakerClient, self).__init__("ws://localhost:80/matchmaker", protocols=["matchmakerProtocol"])

    def received_message(self, message):
        logging.info(message)

    def closed(self, code, reason=None):
        logging.error("[SERIOUS WARNING]: Websocket client shut down!")

    def opened(self):
        logging.info("Matchmaker client started.")

    def unhandled_error(self, error):
        logging.error("[SERIOUS WARNING]: Websocket client error: {}".format(error))




if __name__ == "__main__":
    time.sleep(2)
    ws = MatchmakerClient()
    try:
        ws.connect()
        ws.run_forever()
    except KeyboardInterrupt:
        ws.close()