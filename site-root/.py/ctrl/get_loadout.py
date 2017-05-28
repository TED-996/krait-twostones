import krait
import mvc
from auth_utils import auth_tests
from db_access import db_loadout


class GetLoadoutController(mvc.CtrlBase):
    def __init__(self):
        self.username = auth_tests.get_auth()
    
        self.loadout_id = int(krait.request.query.get("id"))
        if not db_loadout.check_owner(self.loadout_id, self.username):
            krait.response = krait.ResponseBadRequest()
    
        self.loadout = self.get_in_out_format(db_loadout.get_by_id(self.loadout_id))


    def get_view(self):
        return ".view/get_loadout.json.pyml"

    def get_in_out_format(self, loadout_obj):
        loadout_obj.populate()

        return {
            "owner": loadout_obj.player.name,
            "loadoutId": loadout_obj.id,
            "troops": [
                {
                    "id": troop.id,
                    "skin": troop.skin.filename,
                    "className": troop.troop_class.name,
                    "description": troop.troop_class.description,
                    "hp": -1,
                    "dmg": -1,
                    "aRange": -1,
                    "mRange": -1,
                    "modifiers": [
                        mod.id
                        for mod in troop.modifiers
                    ]
                }
                for troop in loadout_obj.troops
            ]
        }
