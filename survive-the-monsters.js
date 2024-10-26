import * as Phaser from "./node_modules/phaser/dist/phaser.esm.js";

const movementConfig = {
    playerSpeed: 300,
    enemiesSpeed: 80,
    bulletsInitialVelocity: 1200,
    bulletsVelocityDamp: 0.99,
};
const enemyHealth = 2;

const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;
const SPRITE_SIZE = 128;
const ENEMIES_COUNT_MAX = 2**8;
const BULLETS_COUNT_MAX = 2**8;

const actors = {
    enemies: new Array(ENEMIES_COUNT_MAX),
    bullets: new Array(BULLETS_COUNT_MAX),
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

const bulletsState = new Uint8Array(BULLETS_COUNT_MAX);
const bulletsType = new Uint8Array(BULLETS_COUNT_MAX);
const bulletsX = new Float64Array(BULLETS_COUNT_MAX);
const bulletsY = new Float64Array(BULLETS_COUNT_MAX);
const bulletsVX = new Float64Array(BULLETS_COUNT_MAX);
const bulletsVY = new Float64Array(BULLETS_COUNT_MAX);
let bulletsLargestId = -1;
bulletsX.fill(NaN);
bulletsY.fill(NaN);

const input = [0, 0];
const direction = [1, 0];
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
    this.load.image("bullet_0", "sprites/bullets/mvp_bullet_0/idle_0.png");
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
    physics: { default: "arcade" },
});

function physicsLoop(dt) {
    updateInput();

    applyPlayerMovement(dt);
    applyEnemiesMovement(dt);
    applyBulletsMovement(dt);

    updateEnemiesPositions();
    updateBulletsPositions();
}

function updateInput() {
    const manX = Number(inputKeys.right.isDown) - Number(inputKeys.left.isDown);
    const manY = Number(inputKeys.down.isDown) - Number(inputKeys.up.isDown);
    const eucSq = manX**2 + manY**2;
    if (eucSq == 0) {
        input[0] = 0;
        input[1] = 0;
        return;
    }
    
    let euc;
    let eigX;
    let eigY;
    if (eucSq < 1) {
        euc = 1;
        eigX = manX;
        eigY = manY;
    } else {
        euc = eucSq**0.5;
        eigX = manX / euc;
        eigY = manY / euc;
    }

    input[0] = eigX;
    input[1] = eigY;
    direction[0] = manX;
    direction[1] = manY;
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
        const manX = playerX - enemiesX[enemyId];
        const manY = playerY - enemiesY[enemyId];
        const eucSq = manX**2 + manY**2;

        let euc;
        let eigX;
        let eigY;
        if (eucSq < 1) {
            euc = 1;
            eigX = manX;
            eigY = manY;
        } else {
            euc = eucSq**0.5;
            eigX = manX / euc;
            eigY = manY / euc;
        }

        enemiesX[enemyId] += eigX * speed;
        enemiesY[enemyId] += eigY * speed;
    }
}
function applyBulletsMovement(dt) {
    for (let bulletId = 0; bulletId <= bulletsLargestId; bulletId++) {
        if (!bulletsState[bulletId]) {
            continue;
        }

        bulletsX[bulletId] += bulletsVX[bulletId] * dt;
        bulletsY[bulletId] += bulletsVY[bulletId] * dt;
        bulletsVX[bulletId] *= movementConfig.bulletsVelocityDamp;
        bulletsVY[bulletId] *= movementConfig.bulletsVelocityDamp;
    }
}

function updateEnemiesPositions() {
    for (let enemyId = 0; enemyId <= enemiesLargestId; enemyId++) {
        if (!enemiesState[enemyId]) {
            continue;
        }
        const x = sceneCenterX - playerX + enemiesX[enemyId];
        const y = sceneCenterY - playerY + enemiesY[enemyId];
        actors.enemies[enemyId].setPosition(x, y);
    }
}
function updateBulletsPositions() {
    for (let bulletId = 0; bulletId <= bulletsLargestId; bulletId++) {
        if (!bulletsState[bulletId]) {
            continue;
        }
        const x = sceneCenterX - playerX + bulletsX[bulletId];
        const y = sceneCenterY - playerY + bulletsY[bulletId];
        actors.bullets[bulletId].setPosition(x, y);
    }
}

function spawnEnemy(x, y, type) {
    if (enemiesLargestId == ENEMIES_COUNT_MAX) {
        return;
    }
    let enemyId = enemiesLargestId + 1;
    for (let id = 0; id < enemyId; id++) {
        if (!enemiesState[id]) {
            enemyId = id;
            break;
        }
    }
    enemiesLargestId = Math.max(enemiesLargestId, enemyId);
    if (enemiesLargestId == ENEMIES_COUNT_MAX) {
        winGame();
        return;
    }
    enemiesState[enemyId] = enemyHealth;
    enemiesType[enemyId] = type;
    enemiesX[enemyId] = x;
    enemiesY[enemyId] = y;
    actors.enemies[enemyId] = scenes.main.physics.add.image(SPRITE_SIZE, SPRITE_SIZE, `monster_${type}`);
    actors.enemies[enemyId].setName(enemyId);
    actors.enemies[enemyId].setCircle(SPRITE_SIZE / 2, 0, 0);
    scenes.main.physics.add.collider(actors.player, actors.enemies[enemyId], loseGame);
    actors.enemies[enemyId].setPosition(x, y);
}
function despawnEnemy(enemyId) {
    if (!enemiesState[enemyId]) {
        return;
    }
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

function spawnBullet(x, y, type, initialVelocity) {
    if (bulletsLargestId == BULLETS_COUNT_MAX) {
        return;
    }
    let bulletId = bulletsLargestId + 1;
    for (let id = 0; id < bulletId; id++) {
        if (!bulletsState[id]) {
            bulletId = id;
            break;
        }
    }
    bulletsLargestId = Math.max(bulletsLargestId, bulletId);
    if (bulletsLargestId == BULLETS_COUNT_MAX) {
        alert("out of ammo. sorry");
    }
    bulletsState[bulletId] = 1;
    bulletsType[bulletId] = type;
    bulletsX[bulletId] = x;
    bulletsY[bulletId] = y;

    actors.bullets[bulletId] = scenes.main.physics.add.image(SPRITE_SIZE, SPRITE_SIZE, `bullet_${type}`);
    actors.bullets[bulletId].setName(bulletId);
    actors.bullets[bulletId].setCircle(SPRITE_SIZE / 2, 0, 0);
    scenes.main.physics.add.collider(actors.bullets[bulletId], actors.enemies, hitEnemy);
    actors.bullets[bulletId].setPosition(x, y);
    actors.bullets[bulletId].setFriction(0);
    bulletsVX[bulletId] = initialVelocity[0];
    bulletsVY[bulletId] = initialVelocity[1];
}
function despawnBullet(bulletId) {
    if (!bulletsState[bulletId]) {
        return;
    }
    bulletsState[bulletId] = 0;
    bulletsX[bulletId] = NaN;
    bulletsY[bulletId] = NaN;
    actors.bullets[bulletId].destroy();
    actors.bullets[bulletId] = undefined;

    if (bulletId != bulletsLargestId) {
        return;
    }
    for (let id = bulletsLargestId - 1; id >= 0; id--) {
        if (!bulletsState[id]) {
            continue;
        }
        bulletsLargestId = id;
        break;
    }
}

function hitEnemy({ name: bulletId }, { name: enemyId }) {
    despawnBullet(bulletId);
    if (enemiesState[enemyId] == 1) {
        despawnEnemy(enemyId);
        return;
    }
    enemiesState[enemyId]--;
}

function winGame() {
    alert("you win! restart?");
    resetGameState();
}
function loseGame() {
    alert("game over, restart?");
    resetGameState();
}
function resetGameState() {
    for (let id = 0; id <= enemiesLargestId; id++) {
        actors.enemies[id].destroy();
    }
    actors.enemies.fill(undefined);
    
    enemiesLargestId = -1;
    enemiesState.fill(0);
    enemiesX.fill(NaN);
    enemiesY.fill(NaN);
}

const spawnRadius = Math.max(SCENE_WIDTH, SCENE_HEIGHT);
const spawnRadiusHalf = spawnRadius / 2;
setInterval(() => {
    const x = playerX - spawnRadiusHalf + spawnRadius * Math.random();
    const y = playerY - spawnRadiusHalf + spawnRadius * Math.random();
    spawnEnemy(x, y, 0);
}, 2000);

setInterval(() => {
    const vx = direction[0] * movementConfig.bulletsInitialVelocity;
    const vy = direction[1] * movementConfig.bulletsInitialVelocity;
    spawnBullet(playerX, playerY, 0, [vx, vy]);
}, 1000);