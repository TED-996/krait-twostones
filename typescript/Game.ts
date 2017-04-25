/// <reference path="node_modules/@types/phaser/phaser.d.ts" />

class WegasGame
{
    game:Phaser.Game;
    cursors:Phaser.CursorKeys;

    constructor()
    {
        // create our phaser game
        // 800 - width
        // 600 - height
        // Phaser.AUTO - determine the renderer automatically (canvas, webgl)
        // 'content' - the name of the container to add our game to
        // { preload:this.preload, create:this.create} - functions to call for our states
        this.game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game-div', {
            preload:this.preload,
            create:this.create,
            update:this.update,
            render:this.render
        });
    }

    preload()
    {
        this.game.load.image( 'moveSprite', "assets/moveSprite.jpg" );
        this.game.stage.backgroundColor = 0xB20059;

    }

    create()
    {
        let logo = this.game.add.sprite( this.game.world.centerX, this.game.world.centerY, 'moveSprite' );
        logo.anchor.setTo( 0.5, 0.5 );

        this.game.world.setBounds(-2000, -2000, 4000, 4000);

        console.log(this.game.camera.x);

        this.cursors = this.game.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.cursors.up.isDown)
        {
            this.game.camera.y -= 4;
        }
        else if (this.cursors.down.isDown)
        {
            this.game.camera.y += 4;
        }

        if (this.cursors.left.isDown)
        {
            this.game.camera.x -= 4;
        }
        else if (this.cursors.right.isDown)
        {
            this.game.camera.x += 4;
        }
    }

    render(){
        this.game.debug.cameraInfo(this.game.camera, 32, 32);
    }
}

// when the page has finished loading, create our game
window.onload = () => {
    new WegasGame();
};