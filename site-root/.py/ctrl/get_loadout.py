import krait
import mvc
from auth_utils import username_utils
from db_access import db_loadout


class GetLoadoutController(mvc.CtrlBase):
    def __init__(self, request):
        self.username = username_utils.get_username(request)
    
        self.loadout_id = int(self.loadout_id)
        if not db_loadout.check_owner(self.loadout_id, self.username):
            raise RuntimeError("Not your loadout!")
    
        self.loadout = db_loadout.get(self.loadout_id)

    def get_view(self):
        return ".view/get_loadout.json.pyml"
