import mvc
from auth_utils import auth_tests
import cookie
from db_access import db_player

class DashboardController(object):
    def __init__(self):
        self.username = auth_tests.get_auth()
        player = auth_tests.get_player_info(self.username);
        self.level = player.player_level
        self.mmr = player.mmr;
    
    def get_view(self):
        return ".view/dashboard.html"
