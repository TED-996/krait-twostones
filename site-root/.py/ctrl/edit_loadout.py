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

        self.loadout_id = krait.request.query.get("loadout_id")
        
        if self.loadout_id == "new":
            self.loadout_id = db_loadout.create(self.username)
        else:
            self.loadout_id = int(self.loadout_id)
            logging.debug("checking owner")

            if not db_loadout.check_owner(self.loadout_id, self.username):
                raise RuntimeError("Not your loadout!")

            logging.debug("checked owner")

    def get_view(self):
        return ".view/edit_loadout.html"
