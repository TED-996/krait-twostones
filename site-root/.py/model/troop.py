from db_access import db_troop

class Troop(object):
    def __init__(self, troop_id, class_id, loadout_id, skin_id):
        self.id = troop_id
        self.class_id = class_id
        self.troop_class = None
        self.skin_id = skin_id
        self.skin = None
        self.loadout_id = loadout_id

        self.modifiers = None

    def populate(self):
        db_troop.populate(self)