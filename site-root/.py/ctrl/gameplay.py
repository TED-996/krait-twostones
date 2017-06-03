import mvc
from auth_utils import auth_tests

class GameplayController(object):
    def __init__(self):
        self.username = auth_tests.get_auth()
        self.level = 0
        self.mmr = 120
    
    def get_view(self):
        return ".view/gameplay.html"