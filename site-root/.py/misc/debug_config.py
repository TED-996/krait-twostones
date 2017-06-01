import logging


is_debug = True


if is_debug:
    logging.basicConfig(level=logging.DEBUG,
                        format="%(asctime)s %(module)s.%(funcName)s: %(message)s",
                        datefmt="%H:%M:%S")
else:
    logging.basicConfig(level=logging.INFO,
                        format="%(asctime)s %(module)s.%(funcName)s: %(message)s",
                        datefmt="%H:%M:%S")