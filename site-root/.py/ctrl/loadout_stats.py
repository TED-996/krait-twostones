from db_access import db_troop_stats
import mvc
import krait


class LoadoutStatsController(mvc.CtrlBase):
    def __init__(self):
        loadout_id = krait.request.query.get("loadout_id")

        troop_stats = db_troop_stats.get_by_loadout_id(loadout_id)
        for stat in troop_stats:
            stat.populate()
        print "populated"

        self.troops = troop_stats
        self.loadout_id = loadout_id

    def class_stats(self, class_obj):
        return "{}/{}/{}/{}".format(class_obj.max_hp, class_obj.dmg,
                                    class_obj.atk_range, class_obj.move_range)

    def mod_stats(self, mod_obj):
        return "{}/{}/{}/{}".format(mod_obj.max_hp, mod_obj.dmg,
                                    mod_obj.atk_range, mod_obj.move_range)

    def get_view(self):
        return ".view/loadout_stats.html"
