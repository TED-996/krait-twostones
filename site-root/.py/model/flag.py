class Flag(object):
    def __init__(self, match_id, flag_idx, x_axis, y_axis, carrying_troop_id):
        self.match_id = match_id
        self.flag_idx = flag_idx
        self.x_axis = x_axis
        self.y_axis = y_axis
        self.carrying_troop_id = carrying_troop_id

        self.carrying_troop = None

    def populate(self):
        from db_access import db_flag
        db_flag.populate(self)

    def to_out_obj(self, is_own):
        self.populate()

        result = {
            "is_own": is_own,
            "x": self.x_axis,
            "y": self.y_axis,
        }
        if self.carrying_troop is not None:
            result["carrying_troop"] = self.carrying_troop.troop.id

        return result