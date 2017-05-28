class Modifier(object):
    def __init__(self, modifier_id, name, max_hp, dmg, atk_range, move_range, min_level):
        self.id = modifier_id
        self.name = name
        self.max_hp = max_hp
        self.dmg = dmg
        self.atk_range = atk_range
        self.move_range = move_range
        self.min_level = min_level
