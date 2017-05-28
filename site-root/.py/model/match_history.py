class MatchHistory(object):
    def __init__(self, matchHistoryId, player1Id, player2Id, score1, score2, mapId, matchStart, duration):
        self.matchHistoryId = matchHistoryId
        self.player1Id = player1Id
        self.player2Id = player2Id
        self.score1 = score1
        self.score2 = score2
        self.mapId = mapId
        self.matchStart = matchStart
        self.duration = duration
        