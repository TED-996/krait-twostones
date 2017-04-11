import krait
import mvc
import json

class LoginFailController(object):
	def __init__(self, request):
		self.error_messages = json.loads(request.query.get("errors", "[]"))

	def get_view(self):
		return ".view/login_fail.html"