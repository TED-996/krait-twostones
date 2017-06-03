import krait
import json
from model import loadout
from model import troop
from model import troop_modifier
from db_access import db_loadout
from db_access import db_player
from db_access import db_modifier
from db_access import db_troop_class
from db_access import db_skin
import logging

def get_response():
    data = json.loads(krait.request.get_post_form().get("loadout-json"))
    loadout_id = data["loadoutId"]
    print "loadout id:", loadout_id

    player_obj = db_player.get_by_username(data["owner"])
    troop_list = []
    for troop_dto in data["troops"]:
        modifier_list = [db_modifier.get_by_id(i) for i in troop_dto["modifiers"]
                         if i is not None]
        print "troop id: ", troop_dto["id"]
        
        class_obj = db_troop_class.get_by_name(troop_dto["className"])
        skin_obj = None if troop_dto["skin"] is None else db_skin.get_by_filename(troop_dto["skin"])

        troop_obj = troop.Troop(troop_dto["id"], class_obj.id, loadout_id,
                                None if skin_obj is None else skin_obj.id)
        
        troop_obj.modifiers = modifier_list
        
        troop_list.append(troop_obj)

    logging.debug("pre loadout ctor")
    loadout_curr = db_loadout.get_by_id(loadout_id)
    if loadout_curr is None:
        return krait.ResponseBadRequest()

    loadout_obj = loadout.Loadout(loadout_id, player_obj.id, loadout_curr.name)
    loadout_obj.troops = troop_list

    logging.debug("pre save")
    db_loadout.save(loadout_obj)

    return krait.ResponseRedirect("/dashboard")
