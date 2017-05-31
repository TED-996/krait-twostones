/// <reference path="node_modules/@types/phaser/phaser.d.ts" />
/// <reference path="Map.ts" />
/// <reference path="TileRenderer.ts" />



var WegasGame = (function () {

    var newTroop;

    function WegasGame() {
        // create our phaser game
        // 800 - width
        // 600 - height
        // Phaser.AUTO - determine the renderer automatically (canvas, webgl)
        // 'content' - the name of the container to add our game to
        // { preload:this.preload, create:this.create} - functions to call for our states
        this.game = new Phaser.Game(1080, 720, Phaser.AUTO, 'game-div', {
            preload: this.preload,
            create: this.create,
            update: this.update,
            render: this.render
        });
    }

    WegasGame.prototype.preload = function () {
        this.game.load.image('moveSprite', "img/moveSprite.jpg");
        this.game.stage.backgroundColor = 0x222222;
        this.map = new GameMap("/map/map.json");
        this.map.tileset.load(this.game);
    };
    WegasGame.prototype.create = function () {
        this.game.world.setBounds(-2000, -2000, 4000, 4000);
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.tileGroup = this.game.add.group();
        this.fgGroup = this.game.add.group();
        var logo = this.tileGroup.create(this.game.world.centerX, this.game.world.centerY, 'moveSprite');
        logo.anchor.setTo(0.5, 0.5);
        this.tileRenderer = new TileRenderer([this.map], [], [], this.map.tileset, this.tileGroup);
        newTroop = this.game.add.sprite(300, 20, 'moveSprite');
        this.game.physics.arcade.enable(newTroop);
        this.game.camera.follows(newTroop);
    };

    WegasGame.prototype.click = function() {
        
    }

    WegasGame.prototype.update = function () {
        if(this.game.input.mousePointer.isDown){
            this.game.camera.follow();
            this.game.physics.arcade.moveToPointer(newTroop, 100);
        }

        if (this.cursors.up.isDown && this.game.camera.y >= 4) {
            this.game.camera.y -= 4;
        }
        else if (this.cursors.down.isDown && this.game.camera.y <= 716) {
            this.game.camera.y += 4;
        }
        if (this.cursors.left.isDown && this.camera.x >= 4) {
            this.game.camera.x -= 4;
        }
        else if (this.cursors.right.isDown && this.camera.x <= 1076) {
            this.game.camera.x += 4;
        }
    };
    WegasGame.prototype.render = function () {
        this.game.debug.cameraInfo(this.game.camera, 32, 32);
    };
    return WegasGame;
}());
// when the page has finished loading, create our game
window.onload = function () {
    new WegasGame();
};
