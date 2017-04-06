from ctrl.admin import user_filter
mvc.set_init_ctrl(user_filter.UserFilterController(request))
