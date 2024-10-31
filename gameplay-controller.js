import {
    PHYSICS_FPS,
    SCENE_WIDTH,
    SCENE_HEIGHT,
    SPRITE_SIZE,
    ENEMIES_COUNT_MAX,
    BULLETS_COUNT_MAX,
    ENEMY_SPAWN_INTERVAL,

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
const spawnRadius = Math.max(SCENE_WIDTH, SCENE_HEIGHT) / 2;
const dt = 1 / PHYSICS_FPS;

export default class GameplayController {
    constructor(enemySpawner, bulletSpawner) {
        this.enemySpawner = enemySpawner;
        this.bulletSpawner = bulletSpawner;
        this.gameProgressState = {
            time: 0,
            kills: 0,
            milestone: 0,
            weapons: [0],
        };
        this.controllerState = {
            enemySpawnTimeAcc: 0,
            bulletSpawnTimeAcc: [0],
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

        const weaponCount = this.gameProgressState.weapons.length;
        for (let weaponIndex = 0; weaponIndex < weaponCount; weaponIndex++) {
            const weaponId = this.gameProgressState.weapons[weaponIndex];
            const reloadTime = bulletTypes[weaponId].reloadTime;
            this.controllerState.bulletSpawnTimeAcc[weaponIndex] += dt;
            if (this.controllerState.bulletSpawnTimeAcc[weaponIndex] > reloadTime) {
                this.controllerState.bulletSpawnTimeAcc[weaponIndex] %= reloadTime;
                this.#spawnBullet(weaponId);
            }
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
        const dir = [Math.random() - 0.5, Math.random() - 0.5];
        const mSq = dir[0]**2 + dir[1]**2;
        let x;
        let y;
        if (mSq < 0.001) {
            x = spawnRadius;
            y = 0;
        } else {
            const m = mSq**0.5;
            x = dir[0] * spawnRadius / m;
            y = dir[1] * spawnRadius / m;
        }
        
        const enemyTypes = progressMilestonesEnemies[this.gameProgressState.milestone];
        const typeIndex = Math.floor(Math.random() * enemyTypes.length);
        const result = this.enemySpawner.spawn(x, y, enemyTypes[typeIndex]);
        // if (result.justReachedFull) {
        //     return;
        // }
    }
    #spawnBullet(weaponId) {
        const result = this.bulletSpawner.spawn(weaponId);
        // if (result.justReachedFull) {
        //     alert("out of ammo. sorry");
        // }
    }

    end() {
        this.controllerState.playing = false;
    }

    hitEnemy(bulletId, enemyId) {
        const type = bullets.data.type[bulletId];
        const damage = bulletTypes[type].damage;
        enemies.data.state[enemyId] = Math.max(0, enemies.data.state[enemyId] - damage);
        this.bulletSpawner.despawn(bulletId);
        if (enemies.data.state[enemyId] == 0) {
            this.enemySpawner.despawn(enemyId);
            this.gameProgressState.kills++;
        }
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
        this.gameProgressState.weapons = [0];

        this.controllerState.enemySpawnTimeAcc = 0;
        this.controllerState.bulletSpawnTimeAcc = [0];
        this.controllerState.playing = false;

        direction[0] = 1;
        direction[1] = 0;
        position[0] = 0;
        position[1] = 0;
    }
}