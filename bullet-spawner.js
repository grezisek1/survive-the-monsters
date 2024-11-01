import {
    bullets,
    position,
    direction,
    CELL_SIZE,
} from "./data.js";

export default class BulletSpawner {
    #bulletTypes;
    #grid;
    constructor(bulletTypes, grid) {
        this.#bulletTypes = bulletTypes;
        this.#grid = grid;
    }
    spawn(type) {
        const state = this.#bulletTypes[type].despawnTime;
        const x = position[0];
        const y = position[1];
        const vx = direction[0] * this.#bulletTypes[type].velocity;
        const vy = direction[1] * this.#bulletTypes[type].velocity;
        const velocityDamp = this.#bulletTypes[type].velocityDamp;
        
        const result = bullets.add({ state, type, x, y, vx, vy, velocityDamp });

        if (result.id == -1) {
            return result;
        }

        const gx = Math.floor(x / CELL_SIZE);
        const gy = Math.floor(y / CELL_SIZE);
        this.#grid.add(result.id, gx, gy);

        return result;
    }

    despawn(id) {
        const gx = Math.floor(bullets.data.x[id] / CELL_SIZE);
        const gy = Math.floor(bullets.data.y[id] / CELL_SIZE);

        const result = bullets.remove(id);
        if (result.removed) {
            this.#grid.remove(id, gx, gy);
        }

        return result;
    }
    reset() {
        this.#grid.reset(map.width / 2, map.height / 2);
    }
}