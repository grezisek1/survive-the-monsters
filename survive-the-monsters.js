import Grid from "./grid.js";
import EnemySpawner from "./enemy-spawner.js";
import BulletSpawner from "./bullet-spawner.js";
import GameplayController from "./gameplay-controller.js";
import {
    PHYSICS_FPS,
    playerSpeed,
    enemyTypes,
    bulletTypes,

    input,
    direction,
    position,

    sprites,

    enemies,
    bullets,
    PLAYER_SIZE,
    CELL_SIZE,
    gridPos,
} from "./data.js";

const sceneCenterX = canvas.width / 2;
const sceneCenterY = canvas.height / 2;
const dt = 1 / PHYSICS_FPS;

const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const enemyGrid = new Grid();
const enemySpawner = new EnemySpawner(enemyTypes, enemyGrid);
const bulletGrid = new Grid();
const bulletSpawner = new BulletSpawner(bulletTypes, bulletGrid);
const controller = new GameplayController(enemySpawner, bulletSpawner);

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
        inputKeys.right = 1;
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
        inputKeys.right = 0;
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
    direction[1] = -manY;
}

let lastTime = performance.now() - PHYSICS_FPS;
let timeAcc = 0;
function loop() {
    const now = performance.now();
    timeAcc += now - lastTime;
    lastTime = now;
    if (timeAcc >= dt) {
        update();
        draw();
        timeAcc %= dt;
    }
    requestAnimationFrame(loop);
}

function update() {
    if (!controller.state.playing) {
        return;
    }

    updatePlayer();
    enemies.iterate(updateEnemy);
    bullets.iterate(updateBullet);

    controller.update();
}
function updatePlayer() {
    const x = position[0] + input[0] * playerSpeed;
    const y = position[1] - input[1] * playerSpeed;
    position[0] = Math.max(controller.state.mapAreaStart, Math.min(x, controller.state.mapAreaEnd));
    position[1] = Math.max(controller.state.mapAreaStart, Math.min(y, controller.state.mapAreaEnd));
    gridPos[0] = Math.floor(position[0] / CELL_SIZE);
    gridPos[1] = Math.floor(position[1] / CELL_SIZE);
    document.body.style.setProperty("--minimap-x", `${gridPos[0]}px`);
    document.body.style.setProperty("--minimap-y", `${gridPos[1]}px`);
    for (let nbhd of enemyGrid.nbhd[gridPos[1]]?.[gridPos[0]]) {
        for (let enemyId of nbhd) {
            const enemyType = enemyTypes[enemies.data.type[enemyId]];
            const manX = enemies.data.x[enemyId] - position[0];
            const manY = enemies.data.y[enemyId] - position[1];
            const eucSq = manX**2 + manY**2;
            if (eucSq > (PLAYER_SIZE / 2 + enemyType.radius)**2) {
                continue;
            }

            controller.hitPlayer(enemyId);
            return;
        }
    }
}
function updateEnemy(id, { x, y, inViewport }) {
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
    
    const gx = Math.floor(x[id] / CELL_SIZE);
    const gy = Math.floor(y[id] / CELL_SIZE);
    const type = enemies.data.type[id];
    const speed = enemyTypes[type].speed;
    x[id] += eigX * speed;
    y[id] += eigY * speed;
    x[id] = Math.max(controller.state.mapAreaStart, Math.min(x[id], controller.state.mapAreaEnd));
    y[id] = Math.max(controller.state.mapAreaStart, Math.min(y[id], controller.state.mapAreaEnd));

    inViewport[id] = Math.abs(x[id] - position[0]) < sceneCenterX && Math.abs(y[id] - position[1]) < sceneCenterY;
    const gxNew = Math.floor(x[id] / CELL_SIZE);
    const gyNew = Math.floor(y[id] / CELL_SIZE);
    if (gx != gxNew || gy != gyNew) {
        enemyGrid.remove(id, gx, gy);
        enemyGrid.add(id, gxNew, gyNew);
    }

    for (let nbhd of bulletGrid.nbhd[gyNew][gxNew]) {
        for (let bulletId of nbhd) {
            const bulletType = bulletTypes[bullets.data.type[bulletId]];
            const manX = bullets.data.x[bulletId] - x[id];
            const manY = bullets.data.y[bulletId] - y[id];
            const eucSq = manX**2 + manY**2;
            if (eucSq > (bulletType.radius + enemyTypes[type].radius)**2) {
                continue;
            }

            controller.hitEnemy(bulletId, id);
        }
    }
}
function updateBullet(id, { x, y, vx, vy, velocityDamp, state, inViewport }) {
    const newState = state[id] - dt;
    if (newState <= 0) {
        bulletSpawner.despawn(id);
        return;
    }
    state[id] = newState;

    const gx = Math.floor(x[id] / CELL_SIZE);
    const gy = Math.floor(y[id] / CELL_SIZE);

    x[id] += vx[id] * dt;
    if (x[id] < controller.state.mapAreaStart || x[id] > controller.state.mapAreaEnd) {
        bulletSpawner.despawn(id);
    }
    y[id] += vy[id] * dt;
    if (y[id] < controller.state.mapAreaStart || y[id] > controller.state.mapAreaEnd) {
        bulletSpawner.despawn(id);
    }
    vx[id] *= velocityDamp[id];
    vy[id] *= velocityDamp[id];

    inViewport[id] = Math.abs(x[id] - position[0]) < sceneCenterX && Math.abs(y[id] - position[1]) < sceneCenterY;
    const gxNew = Math.floor(x[id] / CELL_SIZE);
    const gyNew = Math.floor(y[id] / CELL_SIZE);
    if (gx != gxNew || gy != gyNew) {
        bulletGrid.remove(id, gx, gy);
        bulletGrid.add(id, gxNew, gyNew);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(map,
        map.width / 2 + (position[0] - sceneCenterX) / CELL_SIZE,
        map.height / 2 + (position[1] - sceneCenterY) / CELL_SIZE,
        canvas.width / CELL_SIZE,
        canvas.height / CELL_SIZE,
        0,
        0,
        canvas.width,
        canvas.height,
    );
    ctx.drawImage(sprites.player, sceneCenterX - sprites.player._hx, sceneCenterY - sprites.player._hy);
    enemies.iterate(drawEnemy);
    bullets.iterate(drawBullet);
}
function drawBullet(id, { x, y, type, inViewport }) {
    if (inViewport[id] == 0) {
        return;
    }
    const sprite = sprites.bullets[type[id]];
    const _x = x[id] + sceneCenterX - sprite._hx - position[0];
    const _y = y[id] + sceneCenterY - sprite._hy - position[1];
    ctx.drawImage(sprite, _x, _y);
}
function drawEnemy(id, { x, y, type, inViewport }) {
    if (inViewport[id] == 0) {
        return;
    }
    const sprite = sprites.enemies[type[id]];
    const _x = x[id] + sceneCenterX - sprite._hx - position[0];
    const _y = y[id] + sceneCenterY - sprite._hy - position[1];
    ctx.drawImage(sprite, _x, _y);
}

controller.start(0);
requestAnimationFrame(loop);