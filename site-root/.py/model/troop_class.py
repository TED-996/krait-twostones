class TroopClass(object):
    def __init__(self, troop_class_id, name, description, max_hp, dmg, atk_range, move_range):
        self.id = troop_class_id
        self.name = name
        self.description = description
        self.max_hp = max_hp
        self.dmg = dmg
        self.atk_range = atk_range
        self.move_range = move_range