from ctrl import register_fail
import mvc

mvc.set_init_ctrl(register_fail.RegisterFailController())