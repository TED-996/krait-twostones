import mvc
from auth_utils import auth_tests
import cookie
from db_access import db_player
from db_access import db_loadout


class GameplayController(object):
    def __init__(self):
        self.username = auth_tests.get_auth()
        player = auth_tests.get_player_info(self.username)
        self.level = player.player_level
        self.mmr = player.mmr
        
        self.active_loadout = db_loadout.get_by_id(player.loadout_id)
        
    def get_view(self):
        return ".view/gameplay.html"