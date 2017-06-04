class Troop(object):
    def __init__(self, troop_id, class_id, loadout_id, skin_id):
        self.id = troop_id
        self.class_id = class_id
        self.troop_class = None
        self.skin_id = skin_id
        self.skin = None
        self.loadout_id = loadout_id
        self.loadout = None
        self.hp = 0
        self.dmg = 0
        self.atk_range = 0
        self.move_range = 0
        self.modifiers = None

    def populate(self):
        from db_access import db_troop

        db_troop.populate(self)

    def calculate_stats(self):
        self.populate()
        self.hp = self.troop_class.max_hp
        self.dmg = self.troop_class.dmg
        self.atk_range = self.troop_class.atk_range
        self.move_range = self.troop_class.move_range
        hp = 0
        dmg = 0
        atk_range = 0
        move_range = 0
        for i in self.modifiers:
            if i is not None:
                hp += i.max_hp
                dmg += i.dmg
                atk_range += i.atk_range
                move_range += i.move_range
        self.hp += max(((self.hp * hp)/100), 0.1)
        self.dmg += max(((self.dmg * dmg)/100),0.1)
        self.atk_range = max(((self.atk_range * atk_range)/100), 1)
        self.move_range = max(((self.move_range * move_range)/100), 1)

    def get_stats(self):
        self.calculate_stats()
        return {"hp": self.hp, "dmg": self.dmg, "atk_range": self.atk_range, "move_range": self.move_range}
