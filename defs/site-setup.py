import sys
import os

config_dir = os.path.join(project_dir, ".config")
site_py_dir = os.path.join(project_dir, ".py")
site_ctrl_dir = os.path.join(project_dir, ".ctrl")

# sys.path.append(config_dir)
sys.path.append(site_py_dir)
sys.path.append(site_ctrl_dir)

import krait
krait.site_root = project_dir

import mvc

main_script_path = os.path.join(config_dir, "init.py")
if os.path.exists(main_script_path):
    execfile(main_script_path)

