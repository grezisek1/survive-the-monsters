import {
    PHYSICS_FPS,
    SCENE_WIDTH,
    SCENE_HEIGHT,
    SPRITE_SIZE,
    ENEMIES_COUNT_MAX,
    BULLETS_COUNT_MAX,

    movementConfig,
    enemyTypes,
    bulletTypes,

    input,
    direction,
    position,

    actors,
    enemies,
    bullets,
} from "./data.js";

export function loseGame() {
    alert("game over, restart?");
    resetGameState();
}
export function winGame() {
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

export function startRuntime(enemySpawner, bulletSpawner) {
    const spawnRadius = Math.max(SCENE_WIDTH, SCENE_HEIGHT);
    const spawnRadiusHalf = spawnRadius / 2;
    setInterval(() => {
        const x = position[0] - spawnRadiusHalf + spawnRadius * Math.random();
        const y = position[1] - spawnRadiusHalf + spawnRadius * Math.random();
        const result = enemySpawner.spawn(x, y, 0);
        if (result.justReachedFull) {
            winGame();
            return;
        }
    }, 2000);

    setInterval(() => {
        const vx = direction[0] * movementConfig.bulletsInitialVelocity;
        const vy = direction[1] * movementConfig.bulletsInitialVelocity;
        const result = bulletSpawner.spawn(position[0], position[1], 0, vx, vy);
        if (result.justReachedFull) {
            alert("out of ammo. sorry");
            return;
        }
    }, 1000);
}