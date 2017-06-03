import mvc
from auth_utils import auth_tests
import cookie
from db_access import db_player
from db_access import db_loadout
from model import loadout

class DashboardController(object):
    def __init__(self):
        self.username = auth_tests.get_auth()
       
        player = auth_tests.get_player_info(self.username)
        self.level = player.player_level
        self.mmr = player.mmr
        
        self.active_loadout = db_loadout.get_by_id(player.loadout_id)
        self.user_loadouts = db_loadout.get_all_by_id(player.id)

    def get_view(self):
        return ".view/dashboard.html"

    def make_active_loadout(self, loadout_obj):
        return "makeActiveLoadout(this.id);"