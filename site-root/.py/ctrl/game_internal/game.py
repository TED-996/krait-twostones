import krait
import mvc


class GameController(mvc.CtrlBase):
    def __init__(self, request):
        pass;


    def get_view(self):
        return ".view/game/game.html"
