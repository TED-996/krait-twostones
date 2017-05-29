var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload: preload, create: create, update:update });

function preload() {
    game.load.image('sky', '../phaser_game_tutorial/assets/sky.png');
    game.load.image('ground', '../phaser_game_tutorial/assets/platfomr.png');
    game.load.image('star', '../phaser_game_tutorial/assets/star.png');
    game.load.spritesheet('dude', '../phaser_game_tutorial/assets/dude.png', 32, 48);
}

function create() {
    game.add.sprite(0,0, 'star');
}

function update() {

}