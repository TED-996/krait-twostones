/// <reference path="node_modules/@types/phaser/phaser.d.ts" />
/// <reference path="Map.ts" />
/// <reference path="TileRenderer.ts" />
/// <reference path="GameTroopManager.ts"/>
var WegasGame = (function () {
    function WegasGame() {
        // create our phaser game
        // 800 - width
        // 600 - height
        // Phaser.AUTO - determine the renderer automatically (canvas, webgl)
        // 'content' - the name of the container to add our game to
        // { preload:this.preload, create:this.create} - functions to call for our states
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-div', {
            preload: this.preload,
            create: this.create,
            update: this.update,
            render: this.render
        });
        this.gameController = new GameController(this);
    }
    WegasGame.prototype.preload = function () {
        this.game.load.image('moveSprite', "img/moveSprite.jpg");
        this.game.stage.backgroundColor = 0x222222;
        this.map = new GameMap("/map/map.json");
        this.map.tileset.load(this.game);
    };
    WegasGame.prototype.create = function () {
        var bounds = this.map.bounds;
        this.game.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.playerLoadout = WegasGame.get_loadout("mine");
        this.opponentLoadout = WegasGame.get_loadout("theirs");
        this.playerTroops = [];
        this.opponentTroops = [];
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
    WegasGame.prototype.update = function () {
        if (this.cursors.up.isDown) {
            this.game.camera.y -= 4;
        }
        else if (this.cursors.down.isDown) {
            this.game.camera.y += 4;
        }
        if (this.cursors.left.isDown) {
            this.game.camera.x -= 4;
        }
        else if (this.cursors.right.isDown) {
            this.game.camera.x += 4;
        }
        this.gameController.update();
    };
    WegasGame.prototype.render = function () {
        this.game.debug.cameraInfo(this.game.camera, 32, 32);
        this.gameController.render();
        this.tileRenderer.update();
    };
    return WegasGame;
}());
// when the page has finished loading, create our game
window.onload = function () {
    new WegasGame();
};
