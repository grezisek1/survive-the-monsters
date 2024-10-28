import {
    actors,
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

        const size = this.#enemyTypes[type].size;
        const radius = size / 2;

        actors.enemies[result.id] = this.#scene.physics.add.image(size, size, `monster_${type}`);
        actors.enemies[result.id].setName(result.id);
        actors.enemies[result.id].setCircle(radius, 0, 0);
        this.#scene.physics.add.collider(actors.player, actors.enemies[result.id], this.#onPlayerTouch);
        actors.enemies[result.id].setPosition(x, y);
        return result;
    }

    despawn(id) {
        const result = enemies.remove(id);
        if (!result.removed) {
            return result;
        }

        actors.enemies[id].destroy();
        actors.enemies[id] = undefined;
        return result;
    }
}