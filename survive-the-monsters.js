import * as Phaser from "./node_modules/phaser/dist/phaser.esm.js";

const movementConfig = {
    speed: 300,
};

const GRAVITY = 0;
const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;
const SPRITE_SIZE = 128;
const ENEMIES_COUNT = 2;

const actors = {
    enemies: new Array(ENEMIES_COUNT),
};

const sceneCenterX = SCENE_WIDTH / 2;
const sceneCenterY = SCENE_HEIGHT / 2;
const enemiesX = new Float64Array(ENEMIES_COUNT);
const enemiesY = new Float64Array(ENEMIES_COUNT);
const input = [0, 0];
let playerX = 0;
let playerY = 0;
let inputKeys;

const scenes = {
    main: new Phaser.Scene("MainScene"),
};
scenes.main.preload = function() {
    this.load.image("player", "sprites/players/mvp_player/idle_0.png");
    this.load.image("monster_0", "sprites/monsters/mvp_monster_0/idle_0.png");
    this.load.image("monster_1", "sprites/monsters/mvp_monster_1/idle_0.png");
};
scenes.main.create = function() {
    actors.player = this.physics.add.image(SPRITE_SIZE, SPRITE_SIZE, "player");
    for (let enemyId = 0; enemyId < ENEMIES_COUNT; enemyId++) {
        actors.enemies[enemyId] = this.physics.add.image(SPRITE_SIZE, SPRITE_SIZE, `monster_${enemyId}`);
    }
    
    actors.player.setPosition(sceneCenterX, sceneCenterY);

    this.physics.world.on("worldstep", physicsLoop);
    inputKeys = this.input.keyboard.addKeys({
        up: "W",
        down: "S",
        left: "A",
        right: "D",
    });
};

const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: SCENE_WIDTH,
    height: SCENE_HEIGHT,
    scene: scenes.main,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: GRAVITY }
        }
    }
});

function physicsLoop(dt) {
    updateInput();
    normalizeInput();
    applyMovement(dt);
    updatePositions();
}
function updateInput() {
    input[0] = Number(inputKeys.right.isDown) - Number(inputKeys.left.isDown);
    input[1] = Number(inputKeys.down.isDown) - Number(inputKeys.up.isDown);
}
function normalizeInput() {
    const mSq = input[0]**2 + input[1]**2;
    if (mSq == 0) {
        return;
    }
    const m = mSq**0.5;
    input[0] /= m;
    input[1] /= m;
}
function applyMovement(dt) {
    const speed = movementConfig.speed * dt;
    playerX += input[0] * speed;
    playerY += input[1] * speed;
}
function updatePositions() {
    for (let enemyId = 0; enemyId < ENEMIES_COUNT; enemyId++) {
        const x = sceneCenterX - playerX + enemiesX[enemyId];
        const y = sceneCenterY - playerY + enemiesY[enemyId];
        actors.enemies[enemyId].setPosition(x, y);
    }
}