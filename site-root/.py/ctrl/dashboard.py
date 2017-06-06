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
       
        self.player = auth_tests.get_player_info(self.username)
        self.level = self.player.player_level
        self.mmr = self.player.mmr
        logging.debug("player loadout id: {}".format(self.player.loadout_id))
        
        self.active_loadout = db_loadout.get_by_id(self.player.loadout_id)

        logging.debug(self.active_loadout.id)
        self.user_loadouts = db_loadout.get_all_by_id(self.player.id)
        logging.debug(str(self.user_loadouts[0].name))
        self.new_loadout_id = 0

    def get_view(self):
        return ".view/dashboard.html"

    def make_active_loadout(self, loadout_obj):
        self.player.loadout_id = loadout_obj.id
        db_player.save(self.player)
        return "makeActiveLoadout({});".format(loadout_obj.id)

