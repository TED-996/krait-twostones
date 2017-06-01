import cookie
from db_access import db_player


def get_auth():
    username = cookie.get_cookie("username", None)
    token = cookie.get_cookie("token", None)
    if username is not None and token is not None and _check_token(username, token):
        return username
    else:
        return "wegas_tmp" # TODODODODO


def _check_token(username, token):
    player = db_player.get_by_username(username)
    return player.token == token
