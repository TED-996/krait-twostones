class Match(object):
    def __init__(self, matchId, player1, player2, turn, turnStartTime, score1, score2, mapId, timeStarted):
        self.id = match_id
        self.player1 = player1
        self.player2 = player2
        self.turn = turn
        self.turnStartTime = turnStartTime
        self.score1 = score1
        self.score2 = score2
        self.mapId = mapId
        self.timeStarted = timeStarted
