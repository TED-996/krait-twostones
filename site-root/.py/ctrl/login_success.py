import krait
import mvc

class LoginSuccessController(object):
	def __init__(self, request):
		self.username = request.query.get("login_as", "unknown")

	def get_view(self):
		return ".view/login_success.html"
