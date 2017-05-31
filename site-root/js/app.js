var GravedGame = (function () {
    function GravedGame(hexagonWidth, hexagonHeight, gridSizeX, gridSizeY) {
        this.game = new Phaser.Game(1920, 960, Phaser.AUTO, "content", { preload: this.onPreload, render: this.render, create: this.onCreate });
        this.hexagonWidth = hexagonWidth;
        this.hexagonHeight = hexagonHeight;
        this.gridSizeX = gridSizeX;
        this.gridSizeY = gridSizeY;
        this.columns = [Math.ceil(gridSizeX / 2), Math.floor(gridSizeX / 2)];
        this.sectorWidth = hexagonWidth;
        this.sectorHeight = hexagonHeight / 4 * 3;
        this.gradient = (hexagonHeight / 4) / (hexagonWidth / 2);
    }
    GravedGame.prototype.onPreload = function () {
        this.game.load.image('team1', 'Tiles/mars_04.png');
        this.game.load.image('hexagon', 'Tiles/sand_03.png');
        this.game.load.image('team2', 'Tiles/stone_04.png');
        this.game.load.image('marker', 'Tiles/sand_05.png');
    };
    GravedGame.prototype.render = function () {
    };
    GravedGame.prototype.onCreate = function () {
        this.hexagonGroup = this.game.add.group();
        this.game.stage.backgroundColor = '#ffffff';
        this.hexagonArray = [];
        for (var i = 0; i < this.gridSizeY / 2; i++) {
            this.hexagonArray[i] = [];
            for (var j = 0; j < this.gridSizeX; j++) {
                if (this.gridSizeY % 2 == 0 || i + 1 < this.gridSizeY / 2 || j % 2 == 0) {
                    var hexagonX = this.hexagonWidth * j / 2;
                    var hexagonY = this.hexagonHeight * i * 1.5 + (this.hexagonHeight / 4 * 3) * (j % 2);
                    if (j <= 5) {
                        var hexagon = this.game.add.sprite(hexagonX, hexagonY, 'team1');
                    }
                    else {
                        if (j >= 27) {
                            var hexagon = this.game.add.sprite(hexagonX, hexagonY, 'team2');
                        }
                        else {
                            var hexagon = this.game.add.sprite(hexagonX, hexagonY, 'hexagon');
                        }
                    }
                    this.hexagonGroup.add(hexagon);
                    this.hexagonArray[i][j] = hexagon;
                    var hexagonText = this.game.add.text(hexagonX + this.hexagonWidth / 3 + 5, hexagonY + 15, i + "," + j);
                    hexagonText.font = "arial";
                    hexagonText.fontSize = 12;
                    this.hexagonGroup.add(hexagonText);
                }
            }
        }
        this.hexagonGroup.x = (this.game.width - this.hexagonWidth * Math.ceil(this.gridSizeX / 2)) / 2;
        if (this.gridSizeX % 2 == 0) {
            this.hexagonGroup.x -= this.hexagonWidth / 4;
        }
        this.hexagonGroup.y = (this.game.height - Math.ceil(this.gridSizeY / 2) * this.hexagonHeight - Math.floor(this.gridSizeY / 2) * this.hexagonHeight / 2) / 2;
        if (this.gridSizeY % 2 == 0) {
            this.hexagonGroup.y -= this.hexagonHeight / 8;
        }
        this.marker = this.game.add.sprite(0, 0, 'marker');
        this.marker.anchor.setTo(0.5);
        this.marker.visible = false;
        this.hexagonGroup.add(this.marker);
        this.moveIndex = this.game.input.addMoveCallback(this.checkHex, this);
    };
    GravedGame.prototype.checkHex = function () {
        var candidateX = Math.floor((this.game.input.worldX - this.hexagonGroup.x) / this.sectorWidth);
        var candidateY = Math.floor((this.game.input.worldY - this.hexagonGroup.y) / this.sectorHeight);
        var deltaX = (this.game.input.worldX - this.hexagonGroup.x) % this.sectorWidth;
        var deltaY = (this.game.input.worldY - this.hexagonGroup.y) % this.sectorHeight;
        if (candidateY % 2 == 0) {
            if (deltaY < ((this.hexagonHeight / 4) - deltaX * this.gradient)) {
                candidateX--;
                candidateY--;
            }
            if (deltaY < ((-this.hexagonHeight / 4) + deltaX * this.gradient)) {
                candidateY--;
            }
        }
        else {
            if (deltaX >= this.hexagonWidth / 2) {
                if (deltaY < (this.hexagonHeight / 2 - deltaX * this.gradient)) {
                    candidateY--;
                }
            }
            else {
                if (deltaY < deltaX * this.gradient) {
                    candidateY--;
                }
                else {
                    candidateX--;
                }
            }
        }
        this.placeMarker(candidateX, candidateY);
    };
    GravedGame.prototype.placeMarker = function (posX, posY) {
        for (var i = 0; i < this.gridSizeY / 2; i++) {
            for (var j = 0; j < this.gridSizeX; j++) {
                if (this.gridSizeY % 2 == 0 || i + 1 < this.gridSizeY / 2 || j % 2 == 0) {
                    this.hexagonArray[i][j].tint = 0xffffff;
                }
            }
        }
        if (posX < 0 || posY < 0 || posY >= this.gridSizeY || posX > this.columns[posY % 2] - 1) {
            this.marker.visible = false;
        }
        else {
            this.marker.visible = true;
            this.marker.x = this.hexagonWidth * posX;
            this.marker.y = this.hexagonHeight / 4 * 3 * posY + this.hexagonHeight / 2;
            if (posY % 2 == 0) {
                this.marker.x += this.hexagonWidth / 2;
            }
            else {
                this.marker.x += this.hexagonWidth;
            }
            var markerX = posX * 2 + posY % 2;
            var markerY = Math.floor(posY / 2);
            this.hexagonArray[markerY][markerX].tint = 0xff8800;
            // left
            if (markerX - 2 >= 0) {
                this.hexagonArray[markerY][markerX - 2].tint = 0xff0000;
            }
            // right
            if (markerX + 2 < this.gridSizeX) {
                this.hexagonArray[markerY][markerX + 2].tint = 0xff0000;
            }
            // up
            if (markerY - 1 + markerX % 2 >= 0) {
                // left
                if (markerX - 1 >= 0) {
                    this.hexagonArray[markerY - 1 + markerX % 2][markerX - 1].tint = 0xff0000;
                }
                // right
                if (markerX + 1 < this.gridSizeX) {
                    this.hexagonArray[markerY - 1 + markerX % 2][markerX + 1].tint = 0xff0000;
                }
            }
            // down
            if (markerY + markerX % 2 < this.gridSizeY / 2 && (this.gridSizeY % 2 == 0 || markerY < Math.floor(this.gridSizeY / 2))) {
                // left
                if (markerX - 1 >= 0) {
                    this.hexagonArray[markerY + markerX % 2][markerX - 1].tint = 0xff0000;
                }
                // right
                if (markerX + 1 < this.gridSizeX) {
                    this.hexagonArray[markerY + markerX % 2][markerX + 1].tint = 0xff0000;
                }
            }
        }
    };
    return GravedGame;
}());
window.onload = function () {
    var game = new GravedGame(120, 140, 33, 10);
};
//# sourceMappingURL=app.js.map