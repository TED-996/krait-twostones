import krait
import json
from model import loadout
from model import troop
from model import troop_modifier
from db_access import db_loadout
from db_access import db_player
from db_access import db_troop_modifier
from db_access import db_troop_class
from db_access import db_skin

def get_response():
    data = json.loads(krait.request.get_post_form().get("loadout-json"))

    player_obj = db_player.get_by_username(data["owner"])
    troop_list = []
    for troop in data["troops"]:
        modifier_list = db_troop_modifier.get_by_troop_id(troop["id"])
        
        class_obj = db_troop_class.get_by_name(troop["className"])
        skin_obj = db_skin.get_by_filename(troop["skin"])

        troop_obj = troop.Troop(troop["id"], class_obj.id, data["loadoutId"],
                                skin_obj.id)
        
        troop_obj.modifiers = modifier_list
        
        troop_list.append(troop_obj)

    loadout_obj = loadout.Loadout(data["loadoutId"], player_obj.id)
    loadout_obj.troops = troop_list
    

    db_loadout.save(loadout_obj)

    return krait.ResponseRedirect("/dashboard")
