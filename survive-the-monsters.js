import * as Phaser from "./node_modules/phaser/dist/phaser.esm.js";

const movementConfig = {
    playerSpeed: 300,
    enemiesSpeed: 200,
};

const GRAVITY = 0;
const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;
const SPRITE_SIZE = 128;
const ENEMIES_COUNT_MAX = 2**8;

const actors = {
    enemies: new Array(ENEMIES_COUNT_MAX),
};

const sceneCenterX = SCENE_WIDTH / 2;
const sceneCenterY = SCENE_HEIGHT / 2;

const enemiesState = new Uint8Array(ENEMIES_COUNT_MAX);
const enemiesType = new Uint8Array(ENEMIES_COUNT_MAX);
const enemiesX = new Float64Array(ENEMIES_COUNT_MAX);
const enemiesY = new Float64Array(ENEMIES_COUNT_MAX);
let enemiesLargestId = -1;
enemiesX.fill(NaN);
enemiesY.fill(NaN);

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
    actors.player.setCircle(SPRITE_SIZE / 2, 0, 0);
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
    applyPlayerMovement(dt);
    applyEnemiesMovement(dt);
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

function applyPlayerMovement(dt) {
    const speed = movementConfig.playerSpeed * dt;
    playerX += input[0] * speed;
    playerY += input[1] * speed;
}
function applyEnemiesMovement(dt) {
    const speed = movementConfig.enemiesSpeed * dt;
    
    for (let enemyId = 0; enemyId <= enemiesLargestId; enemyId++) {
        if (!enemiesState[enemyId]) {
            continue;
        }
        const manDistX = playerX - enemiesX[enemyId];
        const manDistY = playerY - enemiesY[enemyId];
        const eucDistSq = manDistX**2 + manDistY**2;

        let eucDist;
        let eigX;
        let eigY;
        if (eucDistSq < 1) {
            eucDist = 1;
            eigX = manDistX;
            eigY = manDistY;
        } else {
            eucDist = eucDistSq**0.5;
            eigX = manDistX / eucDist;
            eigY = manDistY / eucDist;
        }

        enemiesX[enemyId] += eigX * speed;
        enemiesY[enemyId] += eigY * speed;
    }
}

function updatePositions() {
    for (let enemyId = 0; enemyId <= enemiesLargestId; enemyId++) {
        if (!enemiesState[enemyId]) {
            continue;
        }
        const x = sceneCenterX - playerX + enemiesX[enemyId];
        const y = sceneCenterY - playerY + enemiesY[enemyId];
        actors.enemies[enemyId].setPosition(x, y);
    }
}

function spawnEnemy(x, y, type) {
    let enemyId = enemiesLargestId + 1;
    for (let id = 0; id < enemyId; id++) {
        if (!enemiesState[id]) {
            enemyId = id;
            break;
        }
    }
    enemiesLargestId = Math.max(enemiesLargestId, enemyId);

    enemiesState[enemyId] = 1;
    enemiesType[enemyId] = type;
    enemiesX[enemyId] = x;
    enemiesY[enemyId] = y;
    actors.enemies[enemyId] = scenes.main.physics.add.image(SPRITE_SIZE, SPRITE_SIZE, `monster_${type}`);
    actors.enemies[enemyId].setCircle(SPRITE_SIZE / 2, 0, 0);
    scenes.main.physics.add.collider(actors.player, actors.enemies[enemyId], endGame);
    actors.enemies[enemyId].setPosition(x, y);
}
function despawnEnemy(enemyId) {
    enemiesState[enemyId] = 0;
    enemiesX[enemyId] = NaN;
    enemiesY[enemyId] = NaN;
    actors.enemies[enemyId].destroy();
    actors.enemies[enemyId] = undefined;

    if (enemyId != enemiesLargestId) {
        return;
    }
    for (let id = enemiesLargestId - 1; id >= 0; id--) {
        if (!enemiesState[id]) {
            continue;
        }
        enemiesLargestId = id;
        break;
    }
}

const spawnRadius = Math.max(SCENE_WIDTH, SCENE_HEIGHT);
const spawnRadiusHalf = spawnRadius / 2;
setInterval(() => {
    const x = playerX - spawnRadiusHalf + spawnRadius * Math.random();
    const y = playerY - spawnRadiusHalf + spawnRadius * Math.random();
    spawnEnemy(x, y, 0);
}, 2000);

function endGame() {
    alert("game over, restart?");
    for (let id = 0; id <= enemiesLargestId; id++) {
        actors.enemies[id].destroy();
    }
    actors.enemies.fill(undefined);
    
    enemiesLargestId = -1;
    enemiesState.fill(0);
    enemiesX.fill(NaN);
    enemiesY.fill(NaN);
}