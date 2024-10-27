import * as Phaser from "./node_modules/phaser/dist/phaser.esm.js";
import Soa from "./soa.js";
import EnemySpawner from "./enemy-spawner.js";
import BulletSpawner from "./bullet-spawner.js";

const movementConfig = {
    playerSpeed: 5,
    enemiesSpeed: 1,
    bulletsInitialVelocity: 1200,
    velocityDamp: 0.99,
};
const enemyTypes = [
    {
        maxHealth: 2,
        size: 128,
    },
    {
        maxHealth: 2,
        size: 128,
    }
];
const bulletTypes = [
    {
        size: 128,
    },
];
const enemyHealth = 2;

const PHYSICS_FPS = 60;
const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;
const SPRITE_SIZE = 128;
const ENEMIES_COUNT_MAX = 2**8;
const BULLETS_COUNT_MAX = 2**8;

const sceneCenterX = SCENE_WIDTH / 2;
const sceneCenterY = SCENE_HEIGHT / 2;
const dt = 1 / PHYSICS_FPS;

const actors = {
    enemies: new Array(ENEMIES_COUNT_MAX),
    bullets: new Array(BULLETS_COUNT_MAX),
};
const enemies = new Soa({
    state: Uint8Array,
    type: Uint8Array,
    x: Float64Array,
    y: Float64Array,
}, ENEMIES_COUNT_MAX);
const bullets = new Soa({
    state: Uint8Array,
    type: Uint8Array,
    x: Float64Array,
    y: Float64Array,
    vx: Float64Array,
    vy: Float64Array,
}, ENEMIES_COUNT_MAX);

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

const enemySpawner = new EnemySpawner(actors, enemies, enemyTypes, scenes.main, loseGame);
const bulletSpawner = new BulletSpawner(actors, bullets, bulletTypes, scenes.main, hitEnemy);

const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: SCENE_WIDTH,
    height: SCENE_HEIGHT,
    scene: scenes.main,
    physics: { default: "arcade", fps: PHYSICS_FPS, },
});

function physicsLoop() {
    updateInput();

    applyPlayerMovement();
    enemies.iterate(applyTowardsPlayerMovement, movementConfig.enemiesSpeed);
    bullets.iterate(applyVelocityBasedMovement);

    enemies.iterate(updatePosition, actors.enemies);
    bullets.iterate(updatePosition, actors.bullets);
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

function applyPlayerMovement() {
    playerX += input[0] * movementConfig.playerSpeed;
    playerY += input[1] * movementConfig.playerSpeed;
}

function applyVelocityBasedMovement(id, { x, y, vx, vy }) {
    x[id] += vx[id] * dt;
    y[id] += vy[id] * dt;
    vx[id] *= movementConfig.velocityDamp;
    vy[id] *= movementConfig.velocityDamp;
}
function applyTowardsPlayerMovement(id, { x, y }, speed) {
    const manX = playerX - x[id];
    const manY = playerY - y[id];
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
    
    x[id] += eigX * speed;
    y[id] += eigY * speed;
}
function updatePosition(id, { x, y }, actorGroup) {
    actorGroup[id].setPosition(
        sceneCenterX - playerX + x[id],
        sceneCenterY - playerY + y[id],
    );
}

function hitEnemy({ name: bulletId }, { name: enemyId }) {
    bulletSpawner.despawn(bulletId);
    if (enemies.data.state[enemyId] == 1) {
        enemySpawner.despawn(enemyId);
        return;
    }
    enemies.data.state[enemyId]--;
}
function loseGame() {
    alert("game over, restart?");
    resetGameState();
}
function winGame() {
    alert("you win! restart?");
    resetGameState();
}
function resetGameState() {
    for (let id = 0; id < ENEMIES_COUNT_MAX; id++) {
        actors.enemies[id]?.destroy();
    }
    actors.enemies.fill(undefined);
    enemies.reset();

    for (let id = 0; id < BULLETS_COUNT_MAX; id++) {
        actors.bullets[id]?.destroy();
    }
    actors.bullets.fill(undefined);
    bullets.reset();
}

const spawnRadius = Math.max(SCENE_WIDTH, SCENE_HEIGHT);
const spawnRadiusHalf = spawnRadius / 2;
setInterval(() => {
    const x = playerX - spawnRadiusHalf + spawnRadius * Math.random();
    const y = playerY - spawnRadiusHalf + spawnRadius * Math.random();
    const result = enemySpawner.spawn(x, y, 0);
    if (result.justReachedFull) {
        winGame();
        return;
    }
}, 2000);

setInterval(() => {
    const vx = direction[0] * movementConfig.bulletsInitialVelocity;
    const vy = direction[1] * movementConfig.bulletsInitialVelocity;
    const result = bulletSpawner.spawn(playerX, playerY, 0, vx, vy);
    if (result.justReachedFull) {
        alert("out of ammo. sorry");
        return;
    }
}, 1000);