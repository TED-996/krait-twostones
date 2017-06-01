import websockets
import krait
from ctrl.ws import queue_wait
import sys


if websockets.request is None:
    krait.response = krait.ResponseBadRequest()
else:
    protocols = websockets.request.protocols
    if "queueProtocol" in protocols:
        websockets.response = websockets.WebsocketsResponse(queue_wait.QueueWaitController(),"queueProtocol")
    else:
        krait.response = krait.ResponseBadRequest()

sys.stdout.flush()
