import mvc
from auth_utils import auth_tests

class DashboardController(object):
    def __init__(self):
        self.username = auth_tests.get_auth()
    
    def get_view(self):
        return ".view/dashboard.html"
