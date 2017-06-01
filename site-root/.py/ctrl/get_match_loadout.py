import krait
import mvc
from auth_utils import auth_tests
from db_access import db_player
from db_access import db_loadout

class GetMatchLoadoutController(mvc.CtrlBase):
    def __init__(self):
        self.username - auth_tests.get_auth()
        self.loadout_owner = str(krait.request.query.get("which"))

        player = db_player.get_by_username(username)
        
        if self.loadout_owner is "mine":
            self.loadout = db_loadout.get_by_id(player.loadout_id)
        else:
            match = db_match.get_by_player(player)
            if player.id == match.player1:
                opponent = db_player.get_by_id(match.player2)
            else:
                opponent = db_player.get_by_id(match.player1)
            self.loadout = self.get_in_out_format(db_loadout.get_by_id(opponent.loadout_id))
    
    def get_view(self):
        return ".view/get_loadout.json.pyml"

    def get_in_out_format(self, loadout_obj):
        loudout_obj.populate()

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
                        None if mod is None else mod.id
                        for mod in troop.modifiers
                    ]
                }
                for troop in loadout_obj.troops
            ]
        }