/// <reference path="node_modules/@types/phaser/phaser.d.ts" />
/// <reference path="Map.ts" />
/// <reference path="TileRenderer.ts" />
/// <reference path="GameTroop.ts"/>
///<reference path="TroopMoveLayer.ts"/>
///<reference path="TroopAttackLayer.ts"/>
///<reference path="Troops.ts"/>

class WegasGame
{
    game:Phaser.Game;
    cursors:Phaser.CursorKeys;
    map : GameMap;
    tileRenderer : TileRenderer;

    tileGroup : Phaser.Group;
    fgGroup : Phaser.Group;
    playerTroops: GameTroop[];
    playerLoadout: Loadout;
    opponentTroops: GameTroop[];
    opponentLoadout: Loadout;
    gameController : GameController;

    networking : WegasNetworking;
    troopMoveLayer : TroopMoveLayer;
    troopAttackLayer: TroopAttackLayer;
    loadedTroops: GameTroopManager;

    flags : FlagManager;
    renderDirty : boolean;

    cameraSpeed : number;
    cameraMoveDirection : Phaser.Point;

    activeTroop : GameTroop;
    endTurn : Phaser.Button;
    scoreLabel : Phaser.Text;

    constructor()
    {
        this.game = new Phaser.Game(
            document.documentElement.clientWidth,
            document.documentElement.clientHeight,
            //1920, 1080,
            Phaser.CANVAS, 'game-div', {
                preload:this.preload.bind(this),
                create:this.create.bind(this),
                update:this.update.bind(this),
                render:this.render.bind(this)
        });
    }

    preload()
    {
        this.game.load.spritesheet('endTurn', '/img/end_turn.png', 190,48);

        this.map = new GameMap("/map/medievil.json");
        this.map.tileset.load(this.game);

        this.setScale(1);

        this.networking = new WegasNetworking();
        this.gameController = new GameController(this);
        this.troopMoveLayer = new TroopMoveLayer(this);
        this.troopAttackLayer = new TroopAttackLayer(this);

        this.renderDirty = false;

        this.cameraMoveDirection = new Phaser.Point(0, 0);
        this.cameraSpeed = 0;
    }

    create() {
        this.game.stage.backgroundColor = 0x222222;

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.tileGroup = this.game.add.group();
        this.fgGroup = this.game.add.group();

        this.endTurn = this.game.make.button(10, 10, "endTurn",
            this.onEndTurnPressed.bind(this), this,
            4, 3, 5, 3
        );
        this.fgGroup.add(this.endTurn);
        this.scoreLabel = this.game.add.text(this.game.camera.width /2 - 63.5  , 10, '0 : 0', { font: "65px Arial", fill: "##ff0044 ", align: "center" });

        this.fgGroup.add(this.scoreLabel);
        this.updateEndTurn(this.gameController.inTurn);

        this.fgGroup.fixedToCamera = true;

        AllOptions.loadAjax();

        this.playerLoadout = WegasGame.get_loadout("mine");
        this.opponentLoadout = WegasGame.get_loadout("theirs");

        this.playerTroops = [];
        this.opponentTroops = [];
        this.addLoadout(this.playerLoadout, this.playerTroops, false);
        this.addLoadout(this.opponentLoadout, this.opponentTroops, true);

        this.loadedTroops = new GameTroopManager(this.playerTroops.concat(this.opponentTroops));
        this.flags = new FlagManager(this);

        this.tileRenderer = new TileRenderer(
            [this.map],
            [],
            [this.loadedTroops, this.troopMoveLayer, this.troopAttackLayer, this.flags],
            this.map.tileset,
            this.tileGroup);
    }

    public setScale(scale: number) {
        //this.game.scale.setupScale(1920, 1080);

        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;

        this.game.scale.scaleFactor = new Phaser.Point(scale, scale);
        let bounds = this.map.bounds;
        this.game.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

        this.game.scale.refresh();
    }

    private static get_loadout(which: string) : Loadout {
        return Loadout.fromObj(JSON.parse(ajax_raw_sync("/get_match_loadout?which=" + which)));
    }

    public addLoadout(loadout: Loadout, dst : GameTroop[], isEnemy : boolean) {
        for(let i = 0; i < 6; i++){
            dst.push(new GameTroop(loadout.troops[i], this, -1, -1, isEnemy));
        }
    }

    public setRenderDirty(){
        this.renderDirty = true;
    }

    update() {
        this.updateCamera();

        this.gameController.update();
    }

    private updateCamera() {
        let frameMoveDirection: Phaser.Point = new Phaser.Point(0, 0);
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
            if (this.cameraSpeed == 0){
                this.cameraMoveDirection = new Phaser.Point(0, 0);
            }
        }

        this.cameraMoveDirection = Phaser.Point.add(this.cameraMoveDirection, frameMoveDirection.multiply(2, 2));
        if (!this.cameraMoveDirection.isZero()) {
            this.cameraMoveDirection.normalize();
        }

        let isAccelerating = !frameMoveDirection.isZero() && this.cameraMoveDirection.dot(frameMoveDirection) > 0;

        if (isAccelerating) {
            let maxSpeed = 30;
            let accelerationFactor = 0.03;
            this.cameraSpeed = (maxSpeed * accelerationFactor + this.cameraSpeed * (1 - accelerationFactor));
        }
        else {
            this.cameraSpeed = Math.max(this.cameraSpeed - 2, 0);
        }

        if (this.cameraSpeed != 0) {
            let resultVector = this.cameraMoveDirection.multiply(this.cameraSpeed, this.cameraSpeed);
            this.game.camera.x += resultVector.x;
            this.game.camera.y += resultVector.y;
        }
    }

    private getInitCamera() : Coord {
        let xs = 0;
        let ys = 0;
        for (let troop of this.playerTroops){
            xs += troop.x;
            ys += troop.y;
        }

        return {x: xs / this.playerTroops.length, y: ys / this.playerTroops.length};
    }

    private setCamera(coord : Coord) {
        let x = coord.x * this.tileRenderer.tileset.tileWidth;
        let y = coord.y * this.tileRenderer.tileset.tileHeight * 3 / 4;
        console.log(x, y);
        console.log(coord);

        this.game.camera.x = x - this.game.width / 2;
        this.game.camera.y = y - this.game.height / 2;
    }

    render() {
        this.game.debug.cameraInfo(this.game.camera, this.game.width - 300, 32);
        this.gameController.render();

        if (this.renderDirty) {
            console.log("dirty, rendering");
            this.tileRenderer.update();
            this.renderDirty = false;
        }
    }

    onInitialPlace() {
        this.setCamera(this.getInitCamera());
    }

    onTroopClick(troop: GameTroop) {
        if (!this.gameController.inTurn){
            return;
        }
        if (!troop.isEnemy) {
            if (troop != this.activeTroop) {
                if (this.activeTroop != null) {
                    this.activeTroop.deactivate();
                }
                this.activeTroop = troop;
                this.activeTroop.activate();
            }
        }
    }

    deactivateTroop() {
        if (this.activeTroop != null){
            this.activeTroop.deactivate();
            this.activeTroop = null;
        }
    }

    onEndTurnPressed() {
        if (this.gameController.inTurn){
            this.gameController.sendEndTurn();
        }
    }

    updateEndTurn(isInTurn : boolean) {
        if (isInTurn){
            this.endTurn.setFrames(1, 0, 2, 0);
        }
        else{
            this.endTurn.setFrames(4, 3, 5, 3);
        }
    }

    onEndGame() {
        window.location.href = "/dashboard"
    }
}

window.onload = () => {
    new WegasGame();
};