import websockets
from ctrl.ws import matchmaker
import krait

if websockets.request is None:
    krait.response = krait.ResponseBadRequest()
else:
    protocols = websockets.request.protocols
    if "matchmakerProtocol" in protocols:
        websockets.response = websockets.WebsocketsResponse(matchmaker.MatchmakerController(), "matchmakerProtocol")
    else:
        krait.response = krait.ResponseBadRequest()
