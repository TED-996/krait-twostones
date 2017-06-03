/**
 * Created by magan on 6/3/2017.
 */
/// <reference path="node_modules/@types/phaser/phaser.d.ts"/>
/// <reference path="Map.ts" />
/// <reference path="TileRenderer.ts" />
var Background = (function () {
    function Background() {
        this.game = new Phaser.Game(1920, 960, Phaser.AUTO, 'background-div', {
            preload: this.preload,
            create: this.create,
            render: this.render
        });
    }
    Background.prototype.preload = function () {
        this.game.load.image('moveSprite', "img/moveSprite.jpg");
        this.game.stage.backgroundColor = 0x000000;
        this.backgroundMap = new GameMap("/map/backgroundMap.json");
        this.backgroundMap.tileset.load(this.game);
    };
    Background.prototype.create = function () {
        var bounds = this.backgroundMap.bounds;
        this.game.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
        this.tileGroup = this.game.add.group();
        var logo = this.tileGroup.create(this.game.world.centerX, this.game.world.centerY, 'moveSprite');
        logo.anchor.setTo(0.5, 0.5);
        this.tileRenderer = new TileRenderer([this.backgroundMap], [], [], this.backgroundMap.tileset, this.tileGroup);
    };
    Background.prototype.render = function () {
        this.tileRenderer.update();
    };
    return Background;
}());
window.onload = function () {
    new Background();
};
