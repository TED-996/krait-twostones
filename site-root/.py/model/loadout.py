class Loadout(object):
    def __init__(self, loadout_id, player_id, name):
        self.id = loadout_id
        self.player_id = player_id
        self.name = name
        
        self.player = None
        self.troops = None

    def populate(self):
        from db_access import db_loadout

        db_loadout.populate(self)