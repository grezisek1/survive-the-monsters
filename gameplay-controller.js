import {
    PHYSICS_FPS,
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
    gridPos,
    MAP_BORDER_PX,
    CELL_SIZE,
    MAP_BORDER,
} from "./data.js";
const spawnRadius = Math.max(canvas.width, canvas.height) / 2;
const dt = 1 / PHYSICS_FPS;

class State {
    reset() {
        direction[0] = 1;
        direction[1] = 0;
        position[0] = 0;
        position[1] = 0;
        gridPos[0] = 0;
        gridPos[1] = 0;

        this.enemySpawnTimeAcc = 0;
        this.bulletSpawnTimeAcc = [0];
        this.playing = false;
        this.weaponSpawnedInMilestone = false;
        this.time = 0;
        this.kills = 0;
        this.milestone = 0;
        this.weapons = [0];
        this.score = 0;
        this.highscore = 0;
        try {
            this.highscore = Number(localStorage.getItem("highscore"));
        } catch (_) {}
    }
}
export default class GameplayController {
    constructor(enemySpawner, bulletSpawner) {
        this.enemySpawner = enemySpawner;
        this.bulletSpawner = bulletSpawner;
        this.state = new State();
    }

    start(mapId = 0) {
        this.state.reset();
        map.addEventListener("load", this.#mapLoaded);
        map.src = `./sprites/maps/map_${mapId}/image.png`;
        highscore.innerHTML = this.state.highscore;
    }
    #mapLoaded = () => {
        map.removeEventListener("load", this.#mapLoaded);
        this.state.mapAreaStart = (MAP_BORDER - map.width / 2) * CELL_SIZE;
        this.state.mapAreaEnd = (map.width - MAP_BORDER - map.width / 2) * CELL_SIZE;
        document.body.style.setProperty("--minimap-w", `${map.width}px`);
        document.body.style.setProperty("--minimap-h", `${map.height}px`);
        document.body.style.setProperty("--minimap-x", "0px");
        document.body.style.setProperty("--minimap-y", "0px");
        this.enemySpawner.reset();
        this.bulletSpawner.reset();
        this.state.playing = true;
    };
    

    update() {
        if (!this.state.playing) {
            return;
        }

        if (!this.state.weaponSpawnedInMilestone) {
            this.#tryAddWeapon();
        }
        
        this.#trySpawnEnemy();
        this.#spawnBullets();

        this.state.time += dt;
        
        const nextMilestone = this.state.milestone + 1;
        if (nextMilestone == progressMilestones.length) {
            this.winGame();
            return;
        }

        const nextMilestoneTime = progressMilestones[nextMilestone];
        if (this.state.time > nextMilestoneTime) {
            this.state.milestone = nextMilestone;
            this.state.weaponSpawnedInMilestone = false;
        }
    }
    #tryAddWeapon() {
        if (Math.random() > progressMilestonesWeaponChance[this.state.milestone]) {
            return;
        }

        const typeIndex = Math.floor(Math.random() * bulletTypes.length);
        this.state.weapons.push(typeIndex);
        this.state.bulletSpawnTimeAcc.push(0);
        this.state.weaponSpawnedInMilestone = true;

        this.showAlert(`You found ${bulletTypes[typeIndex].name}`);
    }
    #trySpawnEnemy() {
        this.state.enemySpawnTimeAcc += dt;
        const spawnInterval = progressMilestonesSpawnIntervals[this.state.milestone];
        if (this.state.enemySpawnTimeAcc < spawnInterval) {
            return;
        }
        
        this.state.enemySpawnTimeAcc %= spawnInterval;

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

        x += position[0]
        y += position[1];

        const enemyTypes = progressMilestonesEnemies[this.state.milestone];
        const typeIndex = Math.floor(Math.random() * enemyTypes.length);
        this.enemySpawner.spawn(x, y, enemyTypes[typeIndex]);

        this.#increaseScore(typeIndex);
    }
    #spawnBullets() {
        const weaponCount = this.state.weapons.length;
        for (let weaponIndex = 0; weaponIndex < weaponCount; weaponIndex++) {
            this.state.bulletSpawnTimeAcc[weaponIndex] += dt;

            const weaponId = this.state.weapons[weaponIndex];
            const reloadTime = bulletTypes[weaponId].reloadTime;
            if (this.state.bulletSpawnTimeAcc[weaponIndex] < reloadTime) {
                continue;
            }
            this.state.bulletSpawnTimeAcc[weaponIndex] %= reloadTime;
            
            this.bulletSpawner.spawn(weaponId);
            this.#increaseScore(1);
        }
    }

    hitEnemy(bulletId, enemyId) {
        this.#increaseScore(1);
        const type = bullets.data.type[bulletId];
        const damage = bulletTypes[type].damage;
        this.#increaseScore(bulletTypes[type].damage);
        enemies.data.state[enemyId] = Math.max(0, enemies.data.state[enemyId] - damage);
        this.bulletSpawner.despawn(bulletId);
        if (enemies.data.state[enemyId] == 0) {
            this.enemySpawner.despawn(enemyId);
            this.state.kills++;
            this.#increaseScore(enemyId * 10);
        }
    }
    hitPlayer(bulletId) {
        this.loseGame();
    }

    #increaseScore(val) {
        this.state.score += val;
        score.innerHTML = this.state.score;
        if (this.state.score > this.state.highscore) {
            highscore.innerHTML = this.state.score;
        }
    }

    loseGame() {
        this.state.playing = false;
        this.showAlert(`<b>Game Over</b><br><br>You survived <b>${this.state.time>>0} seconds</b>,<br>killed <b>${this.state.kills} enemies</b> and found <b>${this.state.weapons.length} weapons</b>.<br><br>Score: <b>${this.state.score}</b>.<br><br>Restart?`);
        this.#tryUpdateHighscore();
        this.state.reset();
        this.enemySpawner.reset();
        this.bulletSpawner.reset();
    }
    winGame() {
        this.state.playing = false;
        this.showAlert(`You won! You survived ${this.state.time>>0} seconds, killed ${this.state.kills} enemies and found ${this.state.weapons.length} weapons. Score: ${this.state.score}. Restart?`);
        this.#tryUpdateHighscore();
        this.state.reset();
        this.enemySpawner.reset();
        this.bulletSpawner.reset();
    }
    #tryUpdateHighscore() {
        if (this.state.score <= this.state.highscore) {
            return;
        }
        
        this.state.highscore = this.state.score;
        try {
            localStorage.setItem("highscore", this.state.highscore);
        } catch (_) {}

        this.showAlert("New highscore!");
    }

    showAlert(text) {
        this.state.playing = false;
        alert_text.innerHTML = text;
        close_alert.addEventListener("click", this.#closeAlert);
    }
    #closeAlert = () => {
        alert_text.innerHTML = "";
        this.state.playing = true;
        close_alert.removeEventListener("click", this.#closeAlert);
    };
}