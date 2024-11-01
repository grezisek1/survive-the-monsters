import EnemySpawner from "./enemy-spawner.js";
import BulletSpawner from "./bullet-spawner.js";
import GameplayController from "./gameplay-controller.js";
import {
    PHYSICS_FPS,
    SCENE_WIDTH,
    SCENE_HEIGHT,
    playerSpeed,
    enemyTypes,
    bulletTypes,

    input,
    direction,
    position,

    sprites,

    enemies,
    bullets,
} from "./data.js";
const sceneCenterX = SCENE_WIDTH / 2;
const sceneCenterY = SCENE_HEIGHT / 2;
const dt = 1 / PHYSICS_FPS;

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

let lastTime = performance.now() - PHYSICS_FPS;
let timeAcc = 0;
function loop() {
    const now = performance.now();
    timeAcc += now - lastTime;
    if (timeAcc >= PHYSICS_FPS) {
        update();
        draw();
        timeAcc %= PHYSICS_FPS;
    }
}

const enemySpawner = new EnemySpawner(enemyTypes, (_, enemyId) => {
    controller.hitPlayer(enemyId);
});
const bulletSpawner = new BulletSpawner(bulletTypes, (bulletId, enemyId) => {
    controller.hitEnemy(bulletId, enemyId);
});
const controller = new GameplayController(enemySpawner, bulletSpawner);

function update() {
    position[0] += input[0] * playerSpeed;
    position[1] += input[1] * playerSpeed;
    enemies.iterate(applyTowardsPlayerMovement);
    bullets.iterate(applyBulletMovement);
    bullets.iterate(updateBulletState);
    enemies.iterate(updatePosition, sprites.enemies);
    bullets.iterate(updatePosition, sprites.bullets);

    controller.update();
}

let inputKeys = {
    up: 0,
    down: 0,
    left: 0,
    right: 0,
    upOld: 0,
    downOld: 0,
    leftOld: 0,
    rightOld: 0,
};
addEventListener("keydown", e => {
    switch (e.key) {
    case "w":
    case "W":
        inputKeys.up = 1;
        break;

    case "s":
    case "S":
        inputKeys.down = 1;
        break;
    
    case "a":
    case "A":
        inputKeys.left = 1;
        break;
    
    case "d":
    case "D":
        inputKeys.up = 1;
        break;
    }

    updateInput();
});
addEventListener("keyup", e => {
    switch (e.key) {
    case "w":
    case "W":
        inputKeys.up = 0;
        break;
        
    case "s":
    case "S":
        inputKeys.down = 0;
        break;
    
    case "a":
    case "A":
        inputKeys.left = 0;
        break;
    
    case "d":
    case "D":
        inputKeys.up = 0;
        break;
    }

    updateInput();
});
function updateInput() {
    debounce: {
        if (
            inputKeys.upOld != inputKeys.up
            || inputKeys.downOld != inputKeys.down
            || inputKeys.leftOld != inputKeys.left
            || inputKeys.rightOld != inputKeys.right
        ) {
            inputKeys.upOld = inputKeys.up;
            inputKeys.downOld = inputKeys.down;
            inputKeys.leftOld = inputKeys.left;
            inputKeys.rightOld = inputKeys.right;
            break debounce;
        }

        return;
    }

    const manX = inputKeys.right - inputKeys.left;
    const manY = inputKeys.up - inputKeys.down;
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
    if (Math.abs(x - position[0]) > SCENE_WIDTH) {
        return;
    }
    if (Math.abs(y - position[1]) > SCENE_HEIGHT) {
        return;
    }
    actorGroup[id].setPosition(
        sceneCenterX - position[0] + x[id],
        sceneCenterY - position[1] + y[id],
    );
}

function draw() {
    ctx.drawImage(sprites.player, sceneCenterX, sceneCenterY);
    enemies.iterate(drawSprite, sprites.enemies);
    bullets.iterate(drawSprite, sprites.bullets);
}
function drawSprite(id, { x, y, type, inViewport }, sprites) {
    if (inViewport[id] == 0) {
        return;
    }

    const sprite = sprites[type[id]];
    ctx.drawImage(sprite, x - sprite._hx, y - sprite._hy);
}

controller.start();
requestAnimationFrame(loop);