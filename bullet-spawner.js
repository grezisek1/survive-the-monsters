export default class BulletSpawner {
    #bulletTypes;
    #actors;
    #bullets;
    #scene;
    #onEnemyTouch;
    constructor(actors, bullets, bulletTypes, scene, onEnemyTouch) {
        this.#bulletTypes = bulletTypes;
        this.#actors = actors;
        this.#bullets = bullets;
        this.#scene = scene;
        this.#onEnemyTouch = onEnemyTouch;
    }
    spawn(x, y, type, vx, vy) {
        const result = this.#bullets.add({ state: 1, type, x, y, vx, vy });
        if (result.id == -1) {
            return result;
        }

        const size = this.#bulletTypes[type].size;
        const radius = size / 2;

        this.#actors.bullets[result.id] = this.#scene.physics.add.image(size, size, `bullet_${type}`);
        this.#actors.bullets[result.id].setName(result.id);
        this.#actors.bullets[result.id].setCircle(radius, 0, 0);
        this.#scene.physics.add.collider(this.#actors.bullets[result.id], this.#actors.enemies, this.#onEnemyTouch);
        this.#actors.bullets[result.id].setPosition(x, y);
        return result;
    }

    despawn(id) {
        const result = this.#bullets.remove(id);
        if (!result.removed) {
            return result;
        }

        this.#actors.bullets[id].destroy();
        this.#actors.bullets[id] = undefined;
        return result;
    }
}