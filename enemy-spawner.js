import {
    enemies,
} from "./data.js";

export default class EnemySpawner {
    #enemyTypes;
    #scene;
    #onPlayerTouch;
    constructor(enemyTypes, scene, onPlayerTouch) {
        this.#enemyTypes = enemyTypes;
        this.#scene = scene;
        this.#onPlayerTouch = onPlayerTouch;
    }
    spawn(x, y, type) {
        const state = this.#enemyTypes[type].maxHealth;
        const result = enemies.add({ state, type, x, y });
        if (result.id == -1) {
            return result;
        }

        // todo add

        return result;
    }

    despawn(id) {
        const result = enemies.remove(id);
        if (!result.removed) {
            return result;
        }

        // todo remove

        return result;
    }
}