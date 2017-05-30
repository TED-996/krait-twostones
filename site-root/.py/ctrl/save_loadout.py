import krait
import json
from model import loadout
from model import troop
from model import troop_modifier
from db_access import db_loadout
from db_access import db_player
from db_access import db_troop_modifier

def get_response():
    data = json.loads(krait.request.body)

    player_obj = db_player.get_by_username(data["owner"])
    troop_list = []
    for troop in data["troops"]:
        modifier_list = db_troop_modifier.get_by_troop_id(troop.id)
        
        troop_obj = troop.Troop(troop.id, troop.class_id, troop.loadout_id, troop.skin_id)
        troop_obj.modifiers = modifiers_list
        
        troop_list.append(troop_obj)

    
    loadout_obj = loadout.Loadout(data["loadoutId"], player_obj.id)
    loadout_obj.troops = troop_list
    

    db_loadout.save(loadout_obj)

    return krait.ResponseRedirect("/dashboard")
