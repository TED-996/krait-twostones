import websockets
import krait
from ctrl.ws import queue_wait
import sys

print "-------------------------------------------Routable page"

if websockets.request is None:
    print "-------------------------------if-main"
    krait.response = krait.ResponseBadRequest()
else:
    protocols = websockets.request.protocols
    if "queueProtocol" in protocols:
        print "-------------------------------------Before response request"
        websockets.response = websockets.WebsocketsResponse(queue_wait.QueueWaitController(),"queueProtocol")
    else:
        print "-------------------------------------else"
        krait.response = krait.ResponseBadRequest()

sys.stdout.flush()
