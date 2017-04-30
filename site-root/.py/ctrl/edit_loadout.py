import krait
import mvc
from auth_utils import username_utils
from db_access import db_loadout


class EditLoadoutController(mvc.CtrlBase):
    def __init__(self):
        super(EditLoadoutController, self).__init__()
        self.username = username_utils.get_username(krait.request)
        self.loadout_id = krait.request.query.get("loadout_id")
        
        if self.loadout_id == "new":
            self.loadout_id = db_loadout.create(self.username)
        else:
            self.loadout_id = int(self.loadout_id)
            if not db_loadout.check_owner(self.loadout_id, self.username):
                raise RuntimeError("Not your loadout!")

    def get_view(self):
        return ".view/edit_loadout.html"
