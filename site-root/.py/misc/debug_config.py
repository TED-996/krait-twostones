import logging


is_debug = True
show_timing_info = False


if is_debug:
    logging.basicConfig(level=logging.DEBUG,
                        format="%(asctime)s %(module)s.%(funcName)s: %(message)s",
                        datefmt="%H:%M:%S")
else:
    logging.basicConfig(level=logging.INFO,
                        format="%(asctime)s %(module)s.%(funcName)s: %(message)s",
                        datefmt="%H:%M:%S")