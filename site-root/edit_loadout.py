print "pre imports"

from ctrl import edit_loadout
import mvc

print "pre ctrl ctor"
mvc.set_init_ctrl(edit_loadout.EditLoadoutController())
print "post ctrl ctor"
