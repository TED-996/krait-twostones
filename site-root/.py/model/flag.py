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