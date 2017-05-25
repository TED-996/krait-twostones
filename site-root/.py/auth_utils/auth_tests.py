import cookie


def get_auth():
    username = cookie.get_cookie("username", None)
    token = cookie.get_cookie("token", None)
    if username is not None and _check_token(username, token):
        return username
    else:
        return "wegas" # TODODODODO


def _check_token(username, token):
    return True # TODODODODO
