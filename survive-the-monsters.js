import * as Phaser from "./node_modules/phaser/dist/phaser.esm.js";

const GRAVITY = 200;
const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;
const SPRITE_SIZE = 128;

const actors = {};

class GameScene extends Phaser.Scene {
    preload () {
        this.load.image("player", "sprites/players/mvp_player/idle_0.png");
        this.load.image("monster_0", "sprites/monsters/mvp_monster_0/idle_0.png");
        this.load.image("monster_1", "sprites/monsters/mvp_monster_1/idle_0.png");
    }
    create () {
        actors.player = this.physics.add.image(SPRITE_SIZE, SPRITE_SIZE, "player");
        actors.player.setVelocity(100, 0);
        actors.player.setBounce(1, 1);
        actors.player.setCollideWorldBounds(true);

        actors.monster_0 = this.physics.add.image(SPRITE_SIZE, SPRITE_SIZE, "monster_0");
        actors.monster_0.setVelocity(-150, 10);
        actors.monster_0.setBounce(1, 1);
        actors.monster_0.setCollideWorldBounds(true);
        
        actors.monster_1 = this.physics.add.image(SPRITE_SIZE, SPRITE_SIZE, "monster_1");
        actors.monster_1.setVelocity(-200, 0);
        actors.monster_1.setBounce(1, 1);
        actors.monster_1.setCollideWorldBounds(true);
    }
}

const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: SCENE_WIDTH,
    height: SCENE_HEIGHT,
    scene: GameScene,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: GRAVITY }
        }
    }
});