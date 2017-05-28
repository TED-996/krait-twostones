import websockets
import krait
from ctrl.game_internal import game_websockets


if websockets.request is not  None and "WegasNetworking" in websockets.request.protocols:
    websockets.response = websockets.WebsocketsResponse(
        game_websockets.GameWsController(krait.request),
        "WegasNetworking")
else:
    krait.response = krait.ResponseBadRequest()
