from ctrl.admin import user_console
import mvc

mvc.set_init_ctrl(user_console.UserConsoleController())
