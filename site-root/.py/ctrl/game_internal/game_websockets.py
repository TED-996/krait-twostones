from __future__ import print_function
import sys
import json
import time

import websockets
from auth_utils import auth_tests


class GameWsController(websockets.WebsocketsCtrlBase):
    def __init__(self, request):
        super(GameWsController, self).__init__(True)
        self.username = auth_tests.get_auth()
        self.other_player = None # TODO
        self.this_loadout = None # TODO
        self.other_loadout = None # TODO

    def on_thread_start(self):
        while not self.should_stop():
            msg = self.pop_in_message()
            if msg is not None:
                try:
                    self.handle_in_message(json.loads(msg))
                except KeyError as ex:
                    self.respond_error("Missing data field: {!r}".format(ex.args[0]))
            out_msg = self.build_out_message()
            if out_msg is not None:
                self.push_out_message(out_msg)

            time.sleep(0.008)

    def handle_in_message(self, msg_data):
        handlers_by_type = {
            "join": self.handle_join,
            "disconnect": self.handle_disconnect,
            "move": self.handle_move,
            "end_turn": self.handle_end_turn,
            "error": self.handle_error
        }
        handler = handlers_by_type.get(msg_data["type"], None)
        if handler is None:
            self.respond_error("Unrecognized message type {!r}".format(msg_data["type"]))
        else:
            data = msg_data.get("data", None)
            if data is None:
                try:
                    handler()
                except TypeError as err:
                    # TODO: this captures ALL TypeErrors, not no great...
                    self.respond_error("Missing 'data' field in message.")
            else:
                try:
                    handler(data)
                except TypeError as err:
                    # TODO: this captures ALL TypeErrors, not no great...
                    self.respond_error("Extra 'data' field in message.")

    def build_out_message(self):
        return None  # TODO

    def handle_join(self, data):
        print("Client joined.")
        self.respond_ok()

    def handle_disconnect(self, reason):
        print("Client disconnected. Reason: {}".format(reason))

    def handle_move(self, data):
        print("Client requested move. Data: {!r}".format(data))
        self.respond_ok()

    def handle_end_turn(self):
        print("Client requested end turn.")
        self.respond_ok()

    def handle_error(self, data):
        print("Client error:", data, file=sys.stderr)

    def respond_error(self, data):
        self.respond("error", data)

    def respond_ok(self):
        self.respond("ok", None)

    def respond(self, msg_type, msg_data):
        out_dict = {
            "type": msg_type
        }
        if msg_data is not None:
            out_dict["data"] = msg_data

        self.push_out_message(json.dumps(out_dict))
