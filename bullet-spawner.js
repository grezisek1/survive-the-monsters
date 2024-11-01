import {
    bullets,
    position,
    direction,
} from "./data.js";

export default class BulletSpawner {
    #bulletTypes;
    #scene;
    #onEnemyTouch;
    constructor(bulletTypes, scene, onEnemyTouch) {
        this.#bulletTypes = bulletTypes;
        this.#scene = scene;
        this.#onEnemyTouch = onEnemyTouch;
    }
    spawn(type) {
        const state = this.#bulletTypes[type].despawnTime;
        const x = position[0];
        const y = position[1];
        const vx = direction[0] * this.#bulletTypes[type].velocity;
        const vy = direction[1] * this.#bulletTypes[type].velocity;
        const size = this.#bulletTypes[type].size;
        const velocityDamp = this.#bulletTypes[type].velocityDamp;
        
        const result = bullets.add({ state, type, x, y, vx, vy, velocityDamp });

        if (result.id == -1) {
            return result;
        }

        // todo spawn

        return result;
    }

    despawn(id) {
        const result = bullets.remove(id);
        if (!result.removed) {
            return result;
        }

        // todo despawn
        
        return result;
    }
}