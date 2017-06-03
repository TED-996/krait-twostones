/**
 * Created by magan on 6/3/2017.
 */
/// <reference path="node_modules/@types/phaser/phaser.d.ts"/>
/// <reference path="Map.ts" />
/// <reference path="TileRenderer.ts" />

class Background
{
    game: Phaser.Game;
    cursors:Phaser.CursorKeys;
    backgroundMap : GameMap;
    tileRenderer : TileRenderer;

    tileGroup : Phaser.Group;

    constructor()
    {
        this.game = new Phaser.Game(1920, 960, Phaser.AUTO, 'background-div', {
            preload:this.preload,
            create:this.create,
            render:this.render
        });
    }

    preload()
    {
        this.game.load.image('moveSprite', "img/moveSprite.jpg");
        this.game.stage.backgroundColor = 0x000000;
        this.backgroundMap = new GameMap("/map/backgroundMap.json");
        this.backgroundMap.tileset.load(this.game);
    }

    create()
    {
        let bounds = this.backgroundMap.bounds;
        this.game.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

        this.tileGroup = this.game.add.group();

        let logo = this.tileGroup.create(this.game.world.centerX, this.game.world.centerY, 'moveSprite');
        logo.anchor.setTo(0.5, 0.5);
        this.tileRenderer = new TileRenderer([this.backgroundMap], [], [], this.backgroundMap.tileset, this.tileGroup);
    }

    render() {
        this.tileRenderer.update();
    }
}

window.onload = () => {
    new Background();
};