import urllib
import krait
import mvc
from db_access import db_ops
import cx_Oracle
import json
import logging


def get_response():
    post_form = krait.request.get_post_form()
    username = post_form.get("username")
    password = post_form.get("password")

    if username is None or password is None:
        return krait.ResponseBadRequest()
    logging.debug(username)
    try:
        db_conn = db_ops.get_connection()
        cursor = db_conn.cursor()
        cursor.callproc("user_ops.addPlayer", [username, password])
        db_conn.commit()
        cursor.execute("select id from player where playername = :username", {"username": username})
        temp_data = cursor.fetchone()
        logging.debug("Created player")
        if temp_data is not None:
            player_id, = temp_data
        else:
            cursor.execute("delete from player where playername = :username", {"username": username})
            db_conn.commit()
            cursor.close()
            logging.debug("eroare la create player")
            return krait.ResponseBadRequest()

        logging.debug("created player "+str(player_id))
        db_conn.commit()
        cursor.execute("insert into loadout values(loadoutidseq.nextval,'Temp Loadout',:id)", {"id": player_id})
        db_conn.commit()
        cursor.execute("select id from loadout where playerid = :player_id", {"player_id": player_id})
        temp_data = cursor.fetchone()
        if temp_data is not None:
            loadout_id, = temp_data
        else:
            cursor.execute("delete from player where playername = :username", {"username": username})
            db_conn.commit()
            cursor.close()
            logging.debug("eroare la create loadout")
            return krait.ResponseBadRequest()
        logging.debug("created loadout " + str(loadout_id))
        cursor.execute("insert into troop values(troopidseq.nextval,1,:loadout_id,1)", {"loadout_id": loadout_id})
        cursor.execute("insert into troop values(troopidseq.nextval,2,:loadout_id,2)", {"loadout_id": loadout_id})
        cursor.execute("insert into troop values(troopidseq.nextval,3,:loadout_id,3)", {"loadout_id": loadout_id})
        cursor.execute("insert into troop values(troopidseq.nextval,4,:loadout_id,4)", {"loadout_id": loadout_id})
        cursor.execute("insert into troop values(troopidseq.nextval,3,:loadout_id,3)", {"loadout_id": loadout_id})
        cursor.execute("insert into troop values(troopidseq.nextval,2,:loadout_id,2)", {"loadout_id": loadout_id})
        cursor.execute("update player set currentloadout = :loadout_id where id = :player_id", {"loadout_id": loadout_id, "player_id": player_id})
        cursor.close()
        db_conn.commit()
        logging.debug("create complete")
    except cx_Oracle.DatabaseError, exception:
        error_messages = ["Could not add user {}: {}".format(username, exception.args[0].message)]
        redirect_url = "/register_fail"
        redirect_url += "?errors=" + urllib.quote_plus(json.dumps(error_messages))
        logging.debug("Error.")

    redirect_url = "/login"
    return krait.ResponseRedirect(redirect_url)

