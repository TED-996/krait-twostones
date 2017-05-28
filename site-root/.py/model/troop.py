class Troop(object):
    def __init__(self, troop_id, troop_class, skin_filename, modifiers, max_hp, dmg, atk_range, move_range):
        self.id = troop_id
        self.troop_class = troop_class
        self.skin_filename = skin_filename
        self.modifiers = modifiers + [None] * (3 - len(modifiers ))
        self.max_hp = max_hp
        self.dmg = dmg
        self.atk_range = atk_range
        self.move_range = move_range