/// <reference path="node_modules/@types/phaser/phaser.d.ts" />
/// <reference path="Map.ts" />
/// <reference path="TileRenderer.ts" />
/// <reference path="GameTroopManager.ts"/>
var WegasGame = (function () {
    function WegasGame() {
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-div', {
            preload: this.preload.bind(this),
            create: this.create.bind(this),
            update: this.update.bind(this),
            render: this.render.bind(this)
        });
    }
    WegasGame.prototype.preload = function () {
        this.game.load.image('moveSprite', "img/moveSprite.jpg");
        this.game.stage.backgroundColor = 0x222222;
        this.map = new GameMap("/map/map.json");
        this.map.tileset.load(this.game);
        this.gameController = new GameController(this);
        this.renderDirty = false;
        this.cameraMoveDirection = new Phaser.Point(0, 0);
        this.cameraSpeed = 0;
    };
    WegasGame.prototype.create = function () {
        var bounds = this.map.bounds;
        this.game.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
        this.cursors = this.game.input.keyboard.createCursorKeys();
        AllOptions.loadAjax();
        this.playerLoadout = WegasGame.get_loadout("mine");
        this.opponentLoadout = WegasGame.get_loadout("theirs");
        this.playerTroops = [];
        this.opponentTroops = [];
        console.log(typeof (this));
        console.log(this.addLoadout);
        this.addLoadout(this.playerLoadout, this.playerTroops);
        this.addLoadout(this.opponentLoadout, this.opponentTroops);
        this.loadedTroops = new GameTroopManager(this.playerTroops.concat(this.opponentTroops));
        this.tileGroup = this.game.add.group();
        this.fgGroup = this.game.add.group();
        var logo = this.tileGroup.create(this.game.world.centerX, this.game.world.centerY, 'moveSprite');
        logo.anchor.setTo(0.5, 0.5);
        this.tileRenderer = new TileRenderer([this.map], [], [this.loadedTroops], this.map.tileset, this.tileGroup);
        this.troopSprite = this.game.add.sprite(300, 20, 'moveSprite');
        this.game.physics.arcade.enable(logo);
    };
    WegasGame.get_loadout = function (which) {
        return Loadout.fromObj(JSON.parse(ajax_raw_sync("/get_match_loadout?which=" + which)));
    };
    WegasGame.prototype.addLoadout = function (loadout, dst) {
        for (var i = 0; i < 6; i++) {
            var x = Math.floor(Math.random() * this.map.width - 2) + 1;
            var y = Math.floor(Math.random() * this.map.height - 2) + 1;
            dst.push(new GameTroop(loadout.troops[i], x, y, null));
        }
    };
    WegasGame.prototype.setRenderDirty = function () {
        this.renderDirty = true;
    };
    WegasGame.prototype.update = function () {
        this.updateCamera();
        this.gameController.update();
    };
    WegasGame.prototype.updateCamera = function () {
        var frameMoveDirection = new Phaser.Point(0, 0);
        if (this.cursors.up.isDown) {
            frameMoveDirection.y -= 1;
        }
        else if (this.cursors.down.isDown) {
            frameMoveDirection.y += 1;
        }
        if (this.cursors.left.isDown) {
            frameMoveDirection.x -= 1;
        }
        else if (this.cursors.right.isDown) {
            frameMoveDirection.x += 1;
        }
        if (!frameMoveDirection.isZero()) {
            frameMoveDirection.normalize();
        }
        else {
            if (this.cameraSpeed == 0) {
                this.cameraMoveDirection = new Phaser.Point(0, 0);
            }
        }
        this.cameraMoveDirection = Phaser.Point.add(this.cameraMoveDirection, frameMoveDirection);
        if (!this.cameraMoveDirection.isZero()) {
            this.cameraMoveDirection.normalize();
        }
        if (frameMoveDirection.isZero()) {
            this.cameraSpeed = Math.max(this.cameraSpeed - 2, 0);
        }
        else {
            var maxSpeed = 15;
            var accelerationFactor = 0.05;
            this.cameraSpeed = (maxSpeed * accelerationFactor + this.cameraSpeed * (1 - accelerationFactor));
            console.log(this.cameraSpeed);
        }
        if (this.cameraSpeed != 0) {
            var resultVector = this.cameraMoveDirection.multiply(this.cameraSpeed, this.cameraSpeed);
            this.game.camera.x += resultVector.x;
            this.game.camera.y += resultVector.y;
        }
    };
    WegasGame.prototype.render = function () {
        this.game.debug.cameraInfo(this.game.camera, 32, 32);
        this.gameController.render();
        if (this.renderDirty) {
            this.tileRenderer.update();
            this.renderDirty = false;
        }
    };
    WegasGame.prototype.onTroopClick = function (troop) {
        if (!troop.isEnemy) {
            if (troop != this.activeTroop) {
                this.activeTroop.deactivate();
                this.activeTroop = troop;
                this.activeTroop.activate();
            }
        }
    };
    return WegasGame;
}());
window.onload = function () {
    new WegasGame();
};
