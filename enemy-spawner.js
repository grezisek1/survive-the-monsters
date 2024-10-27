export default class EnemySpawner {
    #enemyTypes;
    #actors;
    #enemies;
    #scene;
    #onPlayerTouch;
    constructor(actors, enemies, enemyTypes, scene, onPlayerTouch) {
        this.#enemyTypes = enemyTypes;
        this.#actors = actors;
        this.#enemies = enemies;
        this.#scene = scene;
        this.#onPlayerTouch = onPlayerTouch;
    }
    spawn(x, y, type) {
        const state = this.#enemyTypes[type].maxHealth;
        const result = this.#enemies.add({ state, type, x, y });
        if (result.id == -1) {
            return result;
        }

        const size = this.#enemyTypes[type].size;
        const radius = size / 2;

        this.#actors.enemies[result.id] = this.#scene.physics.add.image(size, size, `monster_${type}`);
        this.#actors.enemies[result.id].setName(result.id);
        this.#actors.enemies[result.id].setCircle(radius, 0, 0);
        this.#scene.physics.add.collider(this.#actors.player, this.#actors.enemies[result.id], this.#onPlayerTouch);
        this.#actors.enemies[result.id].setPosition(x, y);
        return result;
    }

    despawn(id) {
        const result = this.#enemies.remove(id);
        if (!result.removed) {
            return result;
        }

        this.#actors.enemies[id].destroy();
        this.#actors.enemies[id] = undefined;
        return result;
    }
}