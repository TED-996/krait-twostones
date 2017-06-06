import logging

import krait
from db_access import db_loadout


def get_response():
    post_form = krait.request.get_post_form()
    new_name = post_form.get("playername")
    loadout_id = post_form.get("loadout_id")

    if new_name is "" or loadout_id is None or new_name is None:
        return krait.ResponseRedirect("/edit_loadout?loadout_id={}".format(loadout_id))

    logging.debug(new_name)
    new_name = str(new_name).strip()
    db_loadout.update_name(db_loadout.get_by_id(loadout_id, True), new_name)
    return krait.ResponseRedirect("/edit_loadout?loadout_id={}".format(loadout_id))