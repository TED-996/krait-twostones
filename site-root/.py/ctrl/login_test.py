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
        return krait.Response("HTTP/1.1", 400, {}, "<html><body><h1>400 Bad Request</h1></body></html>")

    redirect_url = "/login_fail"
    fail = False
    try:
        db_conn = db_ops.get_connection()
        cursor = db_conn.cursor()
        result = cursor.callfunc("user_ops.checkSaltedPassword", cursor.var(cx_Oracle.NUMBER), [username, password])
        db_conn.commit()
    except cx_Oracle.DatabaseError, exception:
        error_messages = ["Error checking DB for username {}: {}".format(username, exception.args[0])]
        redirect_url += "?errors=" + urllib.quote_plus(json.dumps(error_messages))
        fail = True
        result = 0

    if not fail:
        if result == 1:
            redirect_url = "/login_success?login_as={}".format(urllib.quote_plus(username))
        else:
            redirect_url = "/login_fail?errors=" + urllib.quote_plus(json.dumps(["Invalid password."]))

    return krait.Response("HTTP/1.1", 302, [("Location", redirect_url)], "")
