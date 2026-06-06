import logging

_FORMAT = "%(asctime)s [%(levelname)s] %(name)s (%(filename)s:%(lineno)d): %(message)s"
_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

logging.basicConfig(format=_FORMAT, datefmt=_DATE_FORMAT, level=logging.INFO)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
