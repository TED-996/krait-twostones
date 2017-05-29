from misc import autoflush
print "site_root/edit_loadout.py: pre imports"
import logging
logging.basicConfig(level=logging.DEBUG,
                    format="%(asctime)s %(module)s.%(funcName)s: %(message)s",
                    datefmt="%H:%M:%S")

from ctrl import edit_loadout
import mvc

logging.debug("site_root/edit_loadout.py: pre ctrl ctor")
mvc.set_init_ctrl(edit_loadout.EditLoadoutController())
logging.debug("site_root/edit_loadout.py: post ctrl ctor")
