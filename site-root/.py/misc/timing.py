from functools import wraps
from time import time
import logging
from misc import debug_config


def timing(func):
    if debug_config.is_debug:
        @wraps(func)
        def wrap(*args, **kw):
            ts = time()
            result = func(*args, **kw)
            te = time()
            logging.debug('func:%r args:[%r, %r] took: %2.4f sec' % (func.__name__, args, kw, te - ts))
            return result
        return wrap
    else:
        return func
