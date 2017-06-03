import mvc
from auth_utils import auth_tests
import cookie
from db_access import db_player
from db_access import db_loadout
from model import loadout

class DashboardController(object):
    def __init__(self):
        self.username = auth_tests.get_auth()
        player = auth_tests.get_player_info(self.username);
        self.level = player.player_level
        self.mmr = player.mmr

#Decomentati

        #self.user_loadouts = db_loadout.get_all_by_id(player.id)      
        #self.number_of_loadouts = len(self.user_loadouts)
        
        self.user_loadouts = []
        self.user_loadouts.append(loadout.Loadout(1, player.id, "loadout smecher"))
        self.user_loadouts.append(loadout.Loadout(2, player.id, "dani mocanu"))
        self.user_loadouts.append(loadout.Loadout(3, player.id, "loadout mare mafiot"))
        self.user_loadouts.append(loadout.Loadout(4, player.id, "suflet de golan"))
        self.number_of_loadouts = 4
        
    def get_view(self):
        return ".view/dashboard.html"
