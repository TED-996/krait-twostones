print "initializing logout controller "
from ctrl import logout
import mvc
mvc.set_init_ctrl(logout.LogoutController())