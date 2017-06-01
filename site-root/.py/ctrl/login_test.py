import urllib
import krait
import mvc
from db_access import db_ops
from db_access import db_player
import cx_Oracle
import json
import random
import string
import cookie
import datetime


def get_response():
    post_form = krait.request.get_post_form()
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
            login_user(username)
            redirect_url = "/dashboard?user={}".format(urllib.quote_plus(username))
        else:
            redirect_url = "/login_fail"

    return krait.Response("HTTP/1.1", 302, [("Location", redirect_url)], "")


def login_user(username):
    options = string.digits + string.ascii_letters
    token = "".join(random.choice(options) for _ in xrange(32))

    user = db_player.get_by_username(username)
    user.token = token
    db_player.save(user)

    cookie.set_cookie(
        cookie.Cookie(
            "username",
            username,
            [
                cookie.CookieExpiresAttribute(
                    datetime.datetime.utcnow() + datetime.timedelta(days=30))
            ]
        )
    )
    cookie.set_cookie(
        cookie.Cookie(
            "token",
            token,
            [
                cookie.CookieExpiresAttribute(
                    datetime.datetime.utcnow() + datetime.timedelta(days=30))
            ]
        )
    )
