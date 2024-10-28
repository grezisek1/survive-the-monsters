import {
    PHYSICS_FPS,
    SCENE_WIDTH,
    SCENE_HEIGHT,
    SPRITE_SIZE,
    ENEMIES_COUNT_MAX,
    BULLETS_COUNT_MAX,
    ENEMY_SPAWN_INTERVAL,
    BULLET_SPAWN_INTERVAL,

    movementConfig,
    enemyTypes,
    bulletTypes,

    input,
    direction,
    position,

    actors,
    enemies,
    bullets,
    progressMilestones,
    progressMilestonesEnemies,
} from "./data.js";
const spawnRadius = Math.max(SCENE_WIDTH, SCENE_HEIGHT);
const spawnRadiusHalf = spawnRadius / 2;
const dt = 1 / PHYSICS_FPS;

export default class GameplayController {
    constructor(enemySpawner, bulletSpawner) {
        this.enemySpawner = enemySpawner;
        this.bulletSpawner = bulletSpawner;
        this.gameProgressState = {
            time: 0,
            kills: 0,
            milestone: 0,
        };
        this.controllerState = {
            enemySpawnTimeAcc: 0,
            bulletSpawnTimeAcc: 0,
            playing: false
        };
    }

    start() {
        this.#resetState();
        this.controllerState.playing = true;
    }

    update() {
        if (!this.controllerState.playing) {
            return;
        }

        this.controllerState.enemySpawnTimeAcc += dt;
        if (this.controllerState.enemySpawnTimeAcc > ENEMY_SPAWN_INTERVAL) {
            this.controllerState.enemySpawnTimeAcc %= ENEMY_SPAWN_INTERVAL;
            this.#spawnEnemy();
        }

        this.controllerState.bulletSpawnTimeAcc += dt;
        if (this.controllerState.bulletSpawnTimeAcc > BULLET_SPAWN_INTERVAL) {
            this.controllerState.bulletSpawnTimeAcc %= BULLET_SPAWN_INTERVAL;
            this.#spawnBullet();
        }

        this.gameProgressState.time += dt;
        
        const nextMilestone = this.gameProgressState.milestone + 1;
        if (nextMilestone == progressMilestones.length) {
            this.winGame();
            return;
        }

        const nextMilestoneTime = progressMilestones[nextMilestone];
        if (this.gameProgressState.time > nextMilestoneTime) {
            this.gameProgressState.milestone = nextMilestone;
        }
    }
    #spawnEnemy() {
        const x = position[0] - spawnRadiusHalf + spawnRadius * Math.random();
        const y = position[1] - spawnRadiusHalf + spawnRadius * Math.random();
        
        const enemyTypes = progressMilestonesEnemies[this.gameProgressState.milestone];
        const type = Math.floor(Math.random() * enemyTypes.length);
        const result = this.enemySpawner.spawn(x, y, type);
        // if (result.justReachedFull) {
        //     return;
        // }
    }
    #spawnBullet() {
        const vx = direction[0] * movementConfig.bulletsInitialVelocity;
        const vy = direction[1] * movementConfig.bulletsInitialVelocity;
        const result = this.bulletSpawner.spawn(position[0], position[1], 0, vx, vy);
        // if (result.justReachedFull) {
        //     alert("out of ammo. sorry");
        //     return;
        // }
    }

    end() {
        this.controllerState.playing = false;
    }

    hitEnemy(bulletId, enemyId) {
        this.bulletSpawner.despawn(bulletId);
        if (enemies.data.state[enemyId] == 1) {
            this.enemySpawner.despawn(enemyId);
            this.gameProgressState.kills++;
            return;
        }
        enemies.data.state[enemyId]--;
    }
    hitPlayer(bulletId) {
        this.loseGame();
    }

    loseGame() {
        alert(`game over. you survived ${this.gameProgressState.time>>0} seconds and killed ${this.gameProgressState.kills} enemies, restart?`);
        this.#resetState();
        this.start();
    }
    winGame() {
        alert("you win! restart?");
        this.#resetState();
        this.start();
    }
    #resetState() {
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

        this.gameProgressState.time = 0;
        this.gameProgressState.kills = 0;
        this.gameProgressState.milestone = 0;

        this.controllerState.enemySpawnTimeAcc = 0;
        this.controllerState.bulletSpawnTimeAcc = 0;
        this.controllerState.playing = false;
    }
}