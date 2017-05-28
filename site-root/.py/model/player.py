class Player(object):
    def __init__(self, player_id, name, password, loadout_id, in_match, mmr, player_level, token):
        self.id = player_id
        self.name = name
        self.password = password
        self.loadout_id = loadout_id
        self.in_match = in_match
        self.mmr = mmr
        self.player_level = player_level
        self.token = token
