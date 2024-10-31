import * as Phaser from "./node_modules/phaser/dist/phaser.esm.js";
import EnemySpawner from "./enemy-spawner.js";
import BulletSpawner from "./bullet-spawner.js";
import GameplayController from "./gameplay-controller.js";
import {
    PHYSICS_FPS,
    SCENE_WIDTH,
    SCENE_HEIGHT,
    SPRITE_SIZE,

    playerSpeed,
    enemyTypes,
    bulletTypes,

    input,
    direction,
    position,

    actors,
    enemies,
    bullets,
} from "./data.js";
const sceneCenterX = SCENE_WIDTH / 2;
const sceneCenterY = SCENE_HEIGHT / 2;
const dt = 1 / PHYSICS_FPS;

const scenes = {
    main: new Phaser.Scene("MainScene"),
};
scenes.main.preload = function() {
    this.load.image("player", "sprites/players/mvp_player/idle_0.png");
    for (let i = 0; i < enemyTypes.length; i++) {
        this.load.image(`monster_${i}`, `sprites/monsters/monster_${i}/image.png`);
    }
    for (let i = 0; i < bulletTypes.length; i++) {
        this.load.image(`bullet_${i}`, `sprites/bullets/bullet_${i}/image.png`);
    }
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
    physics: { default: "arcade", fps: PHYSICS_FPS, },
});

const enemySpawner = new EnemySpawner(enemyTypes, scenes.main, function(_, { name: enemyId }) {
    controller.hitPlayer(enemyId);
});
const bulletSpawner = new BulletSpawner(bulletTypes, scenes.main, function({ name: bulletId }, { name: enemyId }) {
    controller.hitEnemy(bulletId, enemyId);
});
const controller = new GameplayController(enemySpawner, bulletSpawner);

function physicsLoop() {
    updateInput();

    position[0] += input[0] * playerSpeed;
    position[1] += input[1] * playerSpeed;
    enemies.iterate(applyTowardsPlayerMovement);
    bullets.iterate(applyBulletMovement);
    bullets.iterate(updateBulletState);
    enemies.iterate(updatePosition, actors.enemies);
    bullets.iterate(updatePosition, actors.bullets);
    enemies.iterate(workaroundSpawnGlitch, actors.enemies);
    bullets.iterate(workaroundSpawnGlitch, actors.bullets);

    controller.update();
}

let inputKeys;
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

function applyBulletMovement(id, { x, y, vx, vy, velocityDamp }) {
    x[id] += vx[id] * dt;
    y[id] += vy[id] * dt;
    vx[id] *= velocityDamp[id];
    vy[id] *= velocityDamp[id];
}
function updateBulletState(id, { state }) {
    state[id] -= dt;
    if (state[id] <= 0) {
        bulletSpawner.despawn(id);
    }
}
function applyTowardsPlayerMovement(id, { x, y }) {
    const manX = position[0] - x[id];
    const manY = position[1] - y[id];
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
    
    const type = enemies.data.type[id];
    const speed = enemyTypes[type].speed;
    x[id] += eigX * speed;
    y[id] += eigY * speed;
}
function updatePosition(id, { x, y }, actorGroup) {
    actorGroup[id].setPosition(
        sceneCenterX - position[0] + x[id],
        sceneCenterY - position[1] + y[id],
    );
}

function workaroundSpawnGlitch(id, _, actorGroup) {
    actorGroup[id].setVisible(true);
}

controller.start();