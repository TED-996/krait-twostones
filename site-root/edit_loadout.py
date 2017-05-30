from misc import autoflush
print "site_root/edit_loadout.py: pre imports"
import logging

from ctrl import edit_loadout
import mvc

logging.debug("site_root/edit_loadout.py: pre ctrl ctor")
mvc.set_init_ctrl(edit_loadout.EditLoadoutController())
logging.debug("site_root/edit_loadout.py: post ctrl ctor")
