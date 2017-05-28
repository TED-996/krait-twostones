class TroopClass(object):
    def __init__(self, troopClassId, name, description, maxHp, dmg, atkRange, moveRange):
        self.id = troopClassId
        self.name = name
        self.description = description
        self.maxHp = maxHp
        self.dmg = dmg
        self.atkRange = atkRange
        self.moveRange = moveRange