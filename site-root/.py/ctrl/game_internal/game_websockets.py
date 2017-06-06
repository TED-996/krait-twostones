from __future__ import print_function
import sys
import json
import time
import logging

import websockets
from auth_utils import auth_tests
from db_access import db_match, db_map, db_troop
from db_access import db_player
from db_access import db_match_troop
from db_access import db_flag


class GameWsController(websockets.WebsocketsCtrlBase):
    def __init__(self, request):
        super(GameWsController, self).__init__(True)
        self.username = auth_tests.get_auth()
        self.match = self.get_match(self.username)
        self.this_player = db_player.get_by_username(self.username)
        if self.this_player.id == self.match.player1_id:
            self.player_idx = 1
            self.other_player = db_player.get_by_id(self.match.player2_id)
        else:
            self.player_idx = 2
            self.other_player = db_player.get_by_id(self.match.player1_id)
        flags = db_flag.get_by_match(self.match.id)
        self.this_flag = [f for f in flags if f.flag_idx == self.player_idx][0]
        self.other_flag = [f for f in flags if f.flag_idx != self.player_idx][0]

        self.this_troops, self.other_troops = self.split_match_troops(db_match_troop.get_by_match(self.match.id))

    def get_match(self, username):
        return db_match.get_by_player(db_player.get_by_username(username))

    def split_match_troops(self, troops):
        this_troops = []
        other_troops = []

        logging.info(troops)

        for troop in troops:
            troop.populate()
            player_id = troop.troop.loadout.player_id
            if player_id == self.this_player.id:
                this_troops.append(troop)
            else:
                other_troops.append(troop)

        return this_troops, other_troops

    def update_match_troops(self):
        for troop in self.this_troops:
            db_match_troop.update(troop)
        for troop in self.other_troops:
            db_match_troop.update(troop)

    def update_flags(self):
        db_flag.update(self.this_flag)
        db_flag.update(self.other_flag)

    def move_troop(self, troop, dest_x, dest_y, tag):
        if not self.is_tile_clear(dest_x, dest_y):
            self.respond_error("Destination not clear", tag)
            return
        if not troop.move_ready:
            self.respond_error("Move consumed!", tag)

        troop.x_axis = dest_x
        troop.y_axis = dest_y
        troop.move_ready = False
        db_match_troop.save(troop)

        self.check_drop_flag(troop)
        self.check_pickup_flag(troop)
        self.check_move_flag(troop)

        self.respond_ok(tag)

    def check_pickup_flag(self, troop):
        if self.other_flag.carrying_troop_id == troop.id or\
                self.this_flag.carrying_troop_id == troop.id:
            # cannot pick up another one
            return

        if self.other_flag.carrying_troop_id is None and\
                self.other_flag.x_axis == troop.x_axis and\
                self.other_flag.y_axis == troop.y_axis:
            self.other_flag.carrying_troop_id = troop.id
            db_flag.save(self.other_flag)
            self.other_flag.populate()

            self.handle_get_flags(None)
        if not self.is_in_base(troop.x_axis, troop.y_axis) and\
                self.this_flag.carrying_troop_id is None and\
                self.this_flag.x_axis == troop.x_axis and\
                self.other_flag.y_axis == troop.y_axis:
            self.this_flag.carrying_troop_id = troop.id
            db_flag.save(self.other_flag)
            self.other_flag.populate()

            self.handle_get_flags(None)

    def check_move_flag(self, troop):
        if self.other_flag.carrying_troop_id == troop.id:
            self.other_flag.x_axis = troop.x_axis
            self.other_flag.y_axis = troop.y_axis
            db_flag.save(self.other_flag)

            self.handle_get_flags(None)

        if self.this_flag.carrying_troop_id == troop.id:
            self.this_flag.x_axis = troop.x_axis
            self.this_flag.y_axis = troop.y_axis
            db_flag.save(self.this_flag)

            self.handle_get_flags(None)

    def check_drop_flag(self, troop):
        base_center = (3, 14) if self.player_idx == 1 else (60, 14)
        if not self.is_in_base(troop.x_axis, troop.y_axis):
            return
        logging.debug("in base: troop.x = {}, troop.y = {}".format(troop.x_axis, troop.y_axis))

        if self.other_flag.carrying_troop_id == troop.id:
            if self.is_in_base(self.this_flag.x_axis, self.this_flag.y_axis):
                self.on_score_point()
            else:
                self.other_flag.x_axis = troop.x_axis
                self.other_flag.y_axis = troop.y_axis
                self.other_flag.carrying_troop_id = None
                db_flag.save(self.other_flag)

            self.handle_get_flags(None)


        if self.this_flag.carrying_troop_id == troop.id:
            self.this_flag.x_axis, self.this_flag.y_axis = base_center
            self.this_flag.carrying_troop_id = None
            db_flag.save(self.this_flag)

            if self.is_in_base(self.other_flag.x_axis, self.other_flag.y_axis):
                self.on_score_point()

            self.handle_get_flags(None)



    def is_in_base(self, x, y):
        logging.debug("x: {}, y: {}".format(x, y))
        base_x = 1 if self.player_idx == 1 else 59
        base_tiles = [(bx, 13) for bx in xrange(base_x, base_x + 3)] + \
                     [(bx, 14) for bx in xrange(base_x, base_x + 4)] + \
                     [(bx, 15) for bx in xrange(base_x, base_x + 3)]
        logging.debug("{!r} vs {!r}".format((x, y), base_tiles))
        return (x, y) in base_tiles

    def on_score_point(self):
        self.other_flag.x_axis, self.other_flag.y_axis = (60, 14) if self.player_idx == 1\
                                                                    else (3, 14)
        self.other_flag.carrying_troop_id = None
        db_flag.save(self.other_flag)

        if self.player_idx == 1:
            self.match.score1 += 1
            db_match.save(self.match)
        else:
            self.match.score2 += 1
            db_match.save(self.match)

    def on_thread_start(self):
        while not self.should_stop():
            msg = self.pop_in_message()
            if msg is not None:
                self.handle_in_message(json.loads(msg))

            self.send_out_messages()

            time.sleep(0.008)

    def handle_in_message(self, msg_data):
        handlers_by_type = {
            "join": self.handle_join,
            "disconnect": self.handle_disconnect,
            "move": self.handle_move,
            "attack": self.handle_attack,
            "end_turn": self.handle_end_turn,
            "error": self.handle_error,
            "get_matchtroops": self.handle_get_matchtroops,
            "get_flags": self.handle_get_flags
        }
        tag = msg_data.get("tag", None)

        handler = handlers_by_type.get(msg_data["type"], None)
        if handler is None:
            self.respond_error("Unrecognized message type {!r}".format(msg_data["type"]), tag)
        else:
            data = msg_data.get("data", None)
            self.call_handler(handler, data, tag)

    def call_handler(self, handler, data, tag):
        if data is None:
            try:
                handler(tag=tag)
            except TypeError as err:
                self.respond_error("Missing 'data' field in message.", tag)
                raise
        else:
            try:
                handler(data, tag=tag)
            except TypeError as err:
                self.respond_error("Extra 'data' field in message.", tag)

                raise

    def send_out_messages(self):
        match_turn = self.match.turn
        db_match.update(self.match)
        if match_turn != self.match.turn and self.match.turn == self.player_idx:
            self.handle_get_matchtroops(None)
            self.handle_get_flags(None)
            self.send("your_turn", None, None)

    def send_troops(self):
        self.update_match_troops()
        mtroops = self.this_troops + self.other_troops

        self.send("get_matchtroops", [mt.to_out_obj() for mt in mtroops])

    def handle_join(self, data, tag=None):
        if self.match is None:
            self.respond_error("You're not in a match.", tag)
        else:
            print("Client joined.")
            db_match.update(self.match)
            self.send("join_ok", {"in_turn": self.match.turn == self.player_idx}, tag)

    def handle_disconnect(self, reason, tag=None):
        print("Client disconnected. Reason: {}".format(reason))

    def handle_move(self, data, tag=None):
        print("Client requested move. Data: {!r}".format(data))
        from_coords = data["from"]
        to_coords = data["to"]
        self.update_match_troops()

        from_troop = self.find_troop(from_coords["x"], from_coords["y"], self.this_troops)
        if from_troop is None:
            self.respond_error("Position doesn't exist.", tag)
            self.handle_get_matchtroops(None)
            return

        self.move_troop(from_troop, to_coords["x"], to_coords["y"], tag)

    def find_troop(self, x, y, troops):
        for troop in troops:
            if troop.x_axis == x and troop.y_axis == y:
                return troop

        return None

    def handle_attack(self, data, tag=None):
        from_coords = data["from"]
        to_coords = data["to"]
        self.update_match_troops()

        from_troop = self.find_troop(from_coords["x"], from_coords["y"], self.this_troops)
        to_troop = self.find_troop(to_coords["x"], to_coords["y"], self.other_troops)

        if from_troop is None or to_troop is None:
            logging.warning("invalid troops: from_troop: {}, to_troop: {}".format(from_troop, to_troop))
            self.respond_error("Position doesn't exist.", tag)
            self.handle_get_matchtroops(None)

        self.attack_troop(from_troop, to_troop, tag)

    def handle_end_turn(self, tag=None):
        print("Client requested end turn.")

        db_match.update(self.match)
        if self.match.turn != self.player_idx:
            self.respond_error("Not your turn.", tag)
        else:
            self.match.turn = 2 - self.match.turn + 1
            db_match.save(self.match)
            self.respond_ok(tag)

        for mtroop in self.this_troops:
            mtroop.attack_ready = True
            mtroop.move_ready = True
            db_match_troop.save(mtroop)

    def handle_error(self, data, tag=None):
        print("Client error:", data, file=sys.stderr)

    def handle_get_matchtroops(self, tag=None):
        self.update_match_troops()
        mtroops = self.this_troops + self.other_troops

        self.send("get_matchtroops", [mt.to_out_obj() for mt in mtroops], tag)

    def handle_get_flags(self, tag=None):
        self.update_flags()

        self.send("get_flags", [self.this_flag.to_out_obj(True), self.other_flag.to_out_obj(False)], tag)

    def respond_error(self, data, tag):
        self.send("error", data, tag=tag)

    def respond_ok(self, tag):
        self.send("ok", None, tag=tag)

    def send(self, msg_type, msg_data, tag=None):
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
        if x <= 0 or x >= map.width - 1:
            logging.debug("X mismatch: {} vs 1-{}".format(x, map.width - 1))
            return False
        if y <= 0 or y >= map.height - 1:
            logging.debug("Y mismatch")
            return False

        for i in troops:
            if i.x_axis == x and i.y_axis == y:
                logging.debug("Tile occupied.")
                return False
        if map.data[y * map.width + x] == 76:
            logging.debug("water!")
            return False
        return True

    def attack_troop(self, troop_1, troop_2, tag):
        if not self.check_attack(troop_1, troop_2):
            self.respond_error("Attack failed (out of range?)", tag)
            return

        troop_2.hp -= troop_1.troop.dmg
        if troop_2.hp <= 0:
            troop_2.respawn_time = 4
            troop_2.x_axis = -5
            troop_2.y_axis = -5
        db_match_troop.save(troop_2)
        return troop_2

    def check_attack(self, from_troop, to_troop):
        db_match_troop.update(from_troop)
        db_match_troop.update(to_troop)
        if self.bfs_dist((from_troop.x_axis, from_troop.y_axis), (to_troop.x_axis, to_troop.y_axis), False,
                from_troop.troop.atk_range) <= from_troop.troop.atk_range and\
                from_troop.attack_ready and from_troop.hp > 0:
            return True
        else:
            return False

    def bfs_dist(self, from_coords, to_coords, obstacle_sensitive=True, limit=None):
        if from_coords == to_coords:
            return 0

        queue = [(from_coords, 0)]
        q_s = 0
        q_e = 1

        visited = {from_coords}
        map = db_map.get_by_id(self.match.map_id)
        map.parse_map()

        while q_s < q_e:
            pos, dist = queue[q_s]
            x, y = pos
            q_s += 1

            if dist >= limit:
                continue

            for next_x, next_y in self.get_neighbors(x, y):
                if next_x <= 0 or next_y <= 0 or next_x >= map.width - 1 or next_y >= map.height - 1:
                    continue

                if (next_x, next_y) in visited:
                    continue
                visited.add((next_x, next_y))

                if visited == to_coords:
                    return dist + 1

                queue.append(((next_x, next_y), dist + 1))
                q_e += 1

        return limit + 1


    def get_neighbors(self, x, y):
        offset = 1 if y % 2 == 0 else 0
        return [
            (x - 1 + offset, y - 1),
            (x + offset,     y - 1),
            (x - 1,          y),
            (x + 1,          y),
            (x - 1 + offset, y + 1),
            (x + offset,     y + 1),

        ]


    def find_first_free_tile(self, x, y):
        queue = [[x,y]]
        count = 1
        current = 0
        dx = [0, -1, -1, -1, 0, 1, 1, 1]
        dy = [-1, -1, 0, 1, 1, 1, 0, -1]
        map = db_map.get_by_id(self.match.map_id)

        visited = []
        for i in range(0,map.width*map.height):
            visited.append(0)

        while current < count and self.is_tile_clear(queue[current][0], queue[current][1]) is False:
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
                start_point = self.find_first_free_tile(x_start, y_start)
                i.x_axis = start_point[0]
                i.y_axis = start_point[1]
                i.hp = i.troop.hp
            db_match_troop.save(i)
