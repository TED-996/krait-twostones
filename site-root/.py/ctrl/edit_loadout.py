import logging

import krait
import mvc
from auth_utils import auth_tests
from db_access import db_loadout

import sys


class EditLoadoutController(mvc.CtrlBase):
    def __init__(self):
        super(EditLoadoutController, self).__init__()
        self.username = auth_tests.get_auth()
        logging.debug("post get_auth")

        player = auth_tests.get_player_info(self.username)
        self.level = player.player_level
        self.mmr = player.mmr
        self.active_loadout = db_loadout.get_by_id(player.loadout_id)
        logging.debug(self.active_loadout.id)


        self.loadout_id = krait.request.query.get("loadout_id")
        
        if self.loadout_id == "new":
            self.loadout_id = db_loadout.create(self.username)
        else:
            self.loadout_id = int(self.loadout_id)
            logging.debug("checking owner")

            if not db_loadout.check_owner(self.loadout_id, self.username):
                raise RuntimeError("Not your loadout!")

            logging.debug("checked owner")

        self.current_loadout_name = db_loadout.get_by_id(self.loadout_id).name

    def get_view(self):
        return ".view/edit_loadout.html"
