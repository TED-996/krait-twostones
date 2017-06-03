import mvc
from auth_utils import auth_tests

class BackgroundController(object):
    def __init__(self):
        self.username = auth_tests.get_auth()
    def get_view(self):
        return ".view/background.html"