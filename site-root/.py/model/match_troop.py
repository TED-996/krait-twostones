class MatchTroop(object):
    def __init__(self, match_troop_id, match_id, troop_id, x_axis, y_axis, hp, respawn_time):
        self.id = match_troop_id
        self.match_id = match_id
        self.troop_id = troop_id
        self.x_axis = x_axis
        self.y_axis = y_axis
        self.hp = hp
        self.respawn_time = respawn_time
        