import mvc
from auth_utils import username_utils
from db_access import db_ops
from model import troop
import krait


class GetOptionsController(mvc.CtrlBase):
    def __init__(self):
        self.username = username_utils.get_username(krait.request)

        conn = db_ops.get_connection()

        self.troop_classes = self.get_troop_classes(conn, self.username)
        self.modifiers = self.get_modifiers(conn, self.username)
        self.skins = self.get_skins(conn, self.username)


    def get_troop_classes(self, conn, username):
        cursor = conn.cursor()
        cursor.execute("select name, description, maxHp, dmg, atkRange, moveRange from TroopClass")
        # TODO: filter by level
        return [troop.TroopClass(name, description, max_hp, dmg, atk_range, move_range)
                for name, description, max_hp, dmg, atk_range, move_range in cursor]

    def get_modifiers(self, conn, username):
        cursor = conn.cursor()
        cursor.execute("select id, name, maxHp, dmg, atkRange, moveRange from Modifier")
        # TODO: filter by level
        return [troop.Modifier(mod_id, name, max_hp, dmg, atk_range, move_range)
                for mod_id, name, max_hp, dmg, atk_range, move_range in cursor]

    def get_skins(self, conn, username):
        return []


    def get_view(self):
        return ".view/get_options.json.pyml"



