import urllib
import krait
import mvc
from db_access import db_ops
import cx_Oracle
import json


def get_response(request):
    post_form = request.get_post_form()
    username = post_form.get("username")
    password = post_form.get("password")

    if username is None or password is None:
        return krait.ResponseBadRequest()

    redirect_url = "/login"
    try:
        db_conn = db_ops.get_connection()
        cursor = db_conn.cursor()
        cursor.callproc("user_ops.addPlayer", [username, password])
        db_conn.commit()
    except cx_Oracle.DatabaseError, exception:
        error_messages = ["Could not add user {}: {}".format(username, exception.args[0].message)]
        redirect_url = "/register_fail"
        redirect_url += "?errors=" + urllib.quote_plus(json.dumps(error_messages))

    return krait.ResponseRedirect(redirect_url)

