import krait
import mvc
from auth_utils import auth_tests
from db_access import db_loadout


class GetLoadoutController(mvc.CtrlBase):
    def __init__(self):
        self.username = auth_tests.get_auth()
    
        self.loadout_id = int(krait.request.query.get("id"))
        if not db_loadout.check_owner(self.loadout_id, self.username):
            raise RuntimeError("Not your loadout!")
    
        self.loadout = db_loadout.get(self.loadout_id)

    def get_view(self):
        return ".view/get_loadout.json.pyml"
