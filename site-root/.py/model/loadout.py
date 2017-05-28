from db_access import db_loadout

class Loadout(object):
    def __init__(self, loadout_id, player_id):
        self.id = loadout_id
        self.player_id = player_id

        self.player = None
        self.troops = None

    def populate(self):
        db_loadout.populate(self)