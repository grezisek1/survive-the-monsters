import {
    actors,
    bullets,
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
    spawn(x, y, type, vx, vy) {
        const result = bullets.add({ state: 1, type, x, y, vx, vy });
        if (result.id == -1) {
            return result;
        }

        const size = this.#bulletTypes[type].size;
        const radius = size / 2;

        actors.bullets[result.id] = this.#scene.physics.add.image(size, size, `bullet_${type}`);
        actors.bullets[result.id].setName(result.id);
        actors.bullets[result.id].setCircle(radius, 0, 0);
        this.#scene.physics.add.collider(actors.bullets[result.id], actors.enemies, this.#onEnemyTouch);
        actors.bullets[result.id].setPosition(x, y);
        return result;
    }

    despawn(id) {
        const result = bullets.remove(id);
        if (!result.removed) {
            return result;
        }

        actors.bullets[id].destroy();
        actors.bullets[id] = undefined;
        return result;
    }
}