import auth_utils
import mvc
from auth_utils import auth_tests
import cookie
from db_access import db_player, db_ops
from db_access import db_loadout
import logging
from model import loadout
import cookie

class DashboardController(object):
    def __init__(self):
        self.username = auth_tests.get_auth()
       
        player = auth_tests.get_player_info(self.username)
        self.level = player.player_level
        self.mmr = player.mmr
        logging.debug("player loadout id: {}".format(player.loadout_id))
        
        self.active_loadout = db_loadout.get_by_id(player.loadout_id)

        logging.debug(self.active_loadout.id)
        self.user_loadouts = db_loadout.get_all_by_id(player.id)
        logging.debug(str(self.user_loadouts[0].name))
        self.new_loadout_id = 0

    def get_view(self):
        return ".view/dashboard.html"

    def make_active_loadout(self, loadout_obj):
        return "makeActiveLoadout({});".format(loadout_obj.id)

