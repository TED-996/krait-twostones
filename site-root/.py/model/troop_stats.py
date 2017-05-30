class TroopStats(object):
    def __init__(self, troop_id, class_id, loadout_id, skin_id, max_hp, dmg, atk_range, move_range):
        self.troop_id = troop_id
        self.class_id = class_id
        self.loadout_id = loadout_id
        self.skin_id = skin_id
        self.max_hp = max_hp
        self.dmg = dmg
        self.atk_range = atk_range
        self.move_range = move_range

        self.troop = None
        self.troop_class = None
        self.loadout = None

    def populate(self):
        from db_access import db_troop_stats
        db_troop_stats.populate(self)
