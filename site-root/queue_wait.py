import websockets
import krait
from ctrl import queue_wait

if websockets.request is None:
    krait.response = krait.ResponseBadRequest()
else:
    protocols = websockets.request.protocols
    if "queueProtocol" in protocols:
        websockets.response = websockets.WebsocketsResponse(queue_wait.QueueWaitController())
    else:
        krait.response = krait.ResponseBadRequest()