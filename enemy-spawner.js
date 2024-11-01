import {
    CELL_SIZE,
    enemies,
} from "./data.js";

export default class EnemySpawner {
    #enemyTypes;
    #grid;
    constructor(enemyTypes, grid) {
        this.#enemyTypes = enemyTypes;
        this.#grid = grid;
    }
    spawn(x, y, type) {
        const state = this.#enemyTypes[type].maxHealth;
        const result = enemies.add({ state, type, x, y });
        if (result.id == -1) {
            return result;
        }

        const gx = Math.floor(x / CELL_SIZE);
        const gy = Math.floor(y / CELL_SIZE);
        this.#grid.add(result.id, gx, gy);

        return result;
    }

    despawn(id) {
        const gx = Math.floor(enemies.data.x[id] / CELL_SIZE);
        const gy = Math.floor(enemies.data.y[id] / CELL_SIZE);

        const result = enemies.remove(id);
        if (result.removed) {
            this.#grid.remove(id, gx, gy);
        }

        return result;
    }
    reset() {
        this.#grid.reset(map.width / 2, map.height / 2);
    }
}