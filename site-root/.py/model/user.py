class User(object):
    def __init__(self, user_id, name, password, loadout_id, in_match, mmr, player_level):
        self.id = user_id
        self.name = name
        self.password = password
        self.loadoutId = loadout_id
        self.inMatch = in_match
        self.mmr = mmr
        self.playerLevel = player_level
