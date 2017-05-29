import mvc
from auth_utils import auth_tests
from db_access import db_ops
from db_access import db_troop_class
from db_access import db_modifier
from db_access import db_skin
import krait


class GetOptionsController(mvc.CtrlBase):
    def __init__(self):
        self.username = auth_tests.get_auth()

        self.troop_classes = self.get_troop_classes(self.username)
        self.modifiers = self.get_modifiers(self.username)
        self.skins = self.get_skins(self.username)


    def get_troop_classes(self, username):
        print "before get_all in troop_class"
        return db_troop_class.get_all()

    def get_modifiers(self, username):
        return db_modifier.get_all()


    def get_skins(self, username):
        return []


    def get_view(self):
        return ".view/get_options.json.pyml"



