import krait
import mvc
import cookie
import datetime

class LogoutController(object):
	def __init__(self):
		pass
        cookie.set_cookie(
            cookie.Cookie(
                "username", 
                "", 
                [
                    cookie.CookieExpiresAttribute(
                        datetime.datetime.utcnow() - datetime.timedelta(days=30)
                )
                ]
            )
        )
        
        cookie.set_cookie(
            cookie.Cookie(
                "token", 
                "", 
                [
                    cookie.CookieExpiresAttribute(
                        datetime.datetime.utcnow() - datetime.timedelta(days=30)
                )
                ]
            )
        )
        

	def get_view(self):
		return ".view/logout.html"
