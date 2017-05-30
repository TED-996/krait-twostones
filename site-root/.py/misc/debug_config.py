import logging


is_debug = False


if is_debug:
    logging.basicConfig(level=logging.DEBUG,
                        format="%(asctime)s %(module)s.%(funcName)s: %(message)s",
                        datefmt="%H:%M:%S")
else:
    logging.basicConfig(level=logging.DEBUG,
                        format="%(asctime)s %(module)s.%(funcName)s: %(message)s",
                        datefmt="%H:%M:%S")