import {
    PHYSICS_FPS,
    SCENE_WIDTH,
    SCENE_HEIGHT,
    ENEMIES_COUNT_MAX,
    BULLETS_COUNT_MAX,
    bulletTypes,
    direction,
    position,
    enemies,
    bullets,
    progressMilestones,
    progressMilestonesEnemies,
    progressMilestonesSpawnIntervals,
    progressMilestonesWeaponChance,
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
            score: 0,
        };
        this.controllerState = {
            enemySpawnTimeAcc: 0,
            bulletSpawnTimeAcc: [0],
            playing: false,
            weaponSpawnedInMilestone: false,
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

        addWeapon: if (!this.controllerState.weaponSpawnedInMilestone) {
            const rand = Math.random();
            if (rand > progressMilestonesWeaponChance[this.gameProgressState.milestone]) {
                break addWeapon;
            }

            const typeIndex = Math.floor(Math.random() * bulletTypes.length);
            this.gameProgressState.weapons.push(typeIndex);
            this.controllerState.bulletSpawnTimeAcc.push(0);
            this.controllerState.weaponSpawnedInMilestone = true;
            alert(`You found ${bulletTypes[typeIndex].name}`)
        }
        
        this.controllerState.enemySpawnTimeAcc += dt;
        const spawnInterval = progressMilestonesSpawnIntervals[this.gameProgressState.milestone];
        if (this.controllerState.enemySpawnTimeAcc > spawnInterval) {
            this.controllerState.enemySpawnTimeAcc %= spawnInterval;
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
            this.controllerState.weaponSpawnedInMilestone = false;
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
        this.enemySpawner.spawn(x, y, enemyTypes[typeIndex]);

        this.gameProgressState.score += typeIndex;
    }
    #spawnBullet(weaponId) {
        this.bulletSpawner.spawn(weaponId);
        this.gameProgressState.score++;
    }

    end() {
        this.controllerState.playing = false;
    }

    hitEnemy(bulletId, enemyId) {
        this.gameProgressState.score++;
        const type = bullets.data.type[bulletId];
        const damage = bulletTypes[type].damage;
        this.gameProgressState.score += bulletTypes[type].damage;
        enemies.data.state[enemyId] = Math.max(0, enemies.data.state[enemyId] - damage);
        this.bulletSpawner.despawn(bulletId);
        if (enemies.data.state[enemyId] == 0) {
            this.enemySpawner.despawn(enemyId);
            this.gameProgressState.kills++;
            this.gameProgressState.score += enemyId * 10;
        }
    }
    hitPlayer(bulletId) {
        this.loseGame();
    }

    loseGame() {
        this.#updateHighscore();
        alert(`Game Over. You survived ${this.gameProgressState.time>>0} seconds, killed ${this.gameProgressState.kills} enemies and found ${this.gameProgressState.weapons.length} weapons. Score: ${this.gameProgressState.score}. Restart?`);
        this.#resetState();
        this.start();
    }
    winGame() {
        this.#updateHighscore();
        alert(`You won! You survived ${this.gameProgressState.time>>0} seconds, killed ${this.gameProgressState.kills} enemies and found ${this.gameProgressState.weapons.length} weapons. Score: ${this.gameProgressState.score}. Restart?`);
        this.#resetState();
        this.start();
    }
    #updateHighscore() {
        if (this.gameProgressState.score > this.gameProgressState.highscore) {
            this.gameProgressState.highscore = this.gameProgressState.score;
            alert("New highscore!");
        }

        try {
            localStorage.setItem("highscore", this.gameProgressState.highscore);
        } catch (_) {}
    }
    #resetState() {
        enemies.reset();
        bullets.reset();

        this.gameProgressState.time = 0;
        this.gameProgressState.kills = 0;
        this.gameProgressState.milestone = 0;
        this.gameProgressState.weapons = [0];
        this.gameProgressState.score = 0;
        try {
            this.gameProgressState.highscore = Number(localStorage.getItem("highscore"));
        } catch (_) {}
        this.controllerState.enemySpawnTimeAcc = 0;
        this.controllerState.bulletSpawnTimeAcc = [0];
        this.controllerState.playing = false;
        this.controllerState.weaponSpawnedInMilestone = false;

        direction[0] = 1;
        direction[1] = 0;
        position[0] = 0;
        position[1] = 0;
    }
}