print "site_root/edit_loadout.py: pre imports"
import logging
logging.basicConfig(level=logging.DEBUG,
                    format="%(asctime)s %(module)s.%(funcName)s: %(message)s",
                    datefmt="%H:%M:%S")

from ctrl import get_loadout
import mvc
mvc.set_init_ctrl(get_loadout.GetLoadoutController())