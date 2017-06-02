import krait
import mvc
import sys
from db_access import db_ops
import json
import urllib
from misc import debug_config
import subprocess
import os


db_ops.read_store_password()

subprocess.Popen(
    ["python", os.path.normpath(os.path.join(krait.site_root, "..", "matchmaker", "matchmaker_client.py"))])
