import {
    actors,
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

        actors.bullets[result.id] = this.#scene.physics.add.image(size, size, `bullet_${type}`);
        actors.bullets[result.id].setName(result.id);
        actors.bullets[result.id].setCircle(size / 2, 0, 0);
        this.#scene.physics.add.collider(actors.bullets[result.id], actors.enemies, this.#onEnemyTouch);
        actors.bullets[result.id].setPosition(x, y);
        actors.bullets[result.id].setVisible(false);
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