from __future__ import print_function
import sys
import json
import time

import websockets
from auth_utils import auth_tests
from db_access import db_match, db_map, db_troop
from db_access import db_player
from db_access import db_match_troop


class GameWsController(websockets.WebsocketsCtrlBase):
    def __init__(self, request):
        super(GameWsController, self).__init__(True)
        self.username = auth_tests.get_auth()
        self.other_player = None  # TODO
        self.this_loadout = None  # TODO
        self.other_loadout = None  # TODO
        self.match = self.get_match(self.username)

    def get_match(self, username):
        return db_match.get_by_player(db_player.get_by_username(username))

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
            "error": self.handle_error,
            "get_matchtroops": self.get_matchtroops
        }
        handler = handlers_by_type.get(msg_data["type"], None)
        if handler is None:
            self.respond_error("Unrecognized message type {!r}".format(msg_data["type"]))
        else:
            data = msg_data.get("data", None)
            tag = msg_data.get("tag", None)
            self.call_handler(handler, data, tag)

    def call_handler(self, handler, data, tag):
        if data is None:
            try:
                handler(tag=tag)
            except TypeError as err:
                # TODO: this captures ALL TypeErrors, not no great...
                self.respond_error("Missing 'data' field in message.")
        else:
            try:
                handler(data, tag=tag)
            except TypeError as err:
                # TODO: this captures ALL TypeErrors, not no great...
                self.respond_error("Extra 'data' field in message.")

    def build_out_message(self):
        return None  # TODO

    def handle_join(self, data, tag=None):
        if self.match is None:
            self.respond_error("You're not in a match.", tag)
        else:
            print("Client joined.")
            self.respond_ok(tag)

    def handle_disconnect(self, reason, tag=None):
        print("Client disconnected. Reason: {}".format(reason))

    def handle_move(self, data, tag=None):
        print("Client requested move. Data: {!r}".format(data))
        from_coords = data["from"]
        to_coords = data["to"]
        self.respond_ok(tag)

    def handle_end_turn(self, tag=None):
        print("Client requested end turn.")
        self.respond_ok(tag)

    def handle_error(self, data, tag=None):
        print("Client error:", data, file=sys.stderr)

    def get_matchtroops(self, tag=None):
        mtroops = db_match_troop.get_by_match(self.match.id)

        self.respond("get_matchtroops", [mt.to_out_obj() for mt in mtroops], tag)

    def respond_error(self, data, tag=None):
        self.respond("error", data, tag=tag)

    def respond_ok(self, tag=None):
        self.respond("ok", None, tag=tag)

    def respond(self, msg_type, msg_data, tag=None):
        out_dict = {
            "type": msg_type
        }
        if msg_data is not None:
            out_dict["data"] = msg_data
        if tag is not None:
            out_dict["tag"] = tag

        self.push_out_message(json.dumps(out_dict))

    def if_on_map(self, x, y, map):
        if x <= 0 or x >= map.height - 1:
            return False
        if y <= 0 or y >= map.width - 1:
            return False
        return True

    def is_tile_clear(self, x, y):
        troops = db_match_troop.get_by_match(self.match.id)
        map = db_map.get_by_id(self.match.map_id)
        if x <= 0 or x >= map.height - 1:
            return False
        if y <= 0 or y >= map.width - 1:
            return False
        for i in troops:
            if i.x_axis == x and i.y_axis == y:
                return False
        if map.data[x * map.width + y] == 76:
            return False
        return True

    def atack_troop(self, troop_1, troop_2):
        troop_2.hp -= troop_1.troop.dmg
        if troop_2.hp <= 0:
            troop_2.respawn_time = 4
        db_match_troop.save(troop_2)
        return troop_2

    def find_fisrt_free_tile(self, x, y):
        queue = [[x,y]]
        count = 1
        current = 0
        dx = [0, -1, -1, -1, 0, 1, 1, 1]
        dy = [-1, -1, 0, 1, 1, 1, 0, -1]
        map = db_map.get_by_id(self.match.map_id)

        visited = []
        for i in range(0,map.width*map.height):
            visited.append(0)

        while (current < count and self.is_tile_clear(queue[current][0],queue[current][1]) is False):
            visited[queue[current][0]*map.width + queue[current][1]] = 1
            for i in range(0, 8):
                if (queue[current][0] + dx[i], queue[current][1] + dy[i], map) is True and \
                        visited[(queue[current][0] + dx[i])*map.width + queue[current][1] + dy[i]] == 0:
                    queue.append([queue[current][0] + dx[i], queue[current][1] + dy[i]])
                    count += 1
            current += 1

        return queue[current]

    def respawn_the_dead(self):
        troops = db_match_troop.get_by_match(self.match.id)
        for i in troops:
            i.respawn_time -= 1
            if i.respawn_time <= 0:
                if self.match.player1_id == (db_troop.get_by_id(i.troop_id)).loadout.player_id:
                    x_start = 1
                    y_start = 15
                else:
                    x_start = 63
                    y_start = 15
                start_point = self.find_fisrt_free_tile(x_start,y_start)
                i.x_axis = start_point[0]
                i.y_axis = start_point[1]
                i.hp = i.troop.hp
            db_match_troop.save(i)
