class MatchTroop(object):
    def __init__(self, match_troop_id, match_id, troop_id, x_axis, y_axis, hp, respawn_time):
        self.id = match_troop_id
        self.match_id = match_id
        self.troop_id = troop_id
        self.x_axis = x_axis
        self.y_axis = y_axis
        self.hp = hp
        self.respawn_time = respawn_time

        self.match = None
        self.troop = None

    def populate(self):
        from db_access import db_match_troop
        db_match_troop.populate(self)

    def to_out_obj(self):
        return {
            "id": self.id,
            "match": self.match_id,
            "troop": self.troop_id,
            "x": self.x_axis,
            "y": self.y_axis,
            "hp": self.hp,
            "respawn": self.respawn_time
        }