import Soa from "./soa.js";

export const PHYSICS_FPS = 60;
export const SCENE_WIDTH = 1920;
export const SCENE_HEIGHT = 1080;
export const PLAYER_SIZE = 128;
export const ENEMIES_COUNT_MAX = 2**12;
export const BULLETS_COUNT_MAX = 2**14;

export const playerSpeed = 6;
export const enemyTypes = [
    {
        maxHealth: 1,
        size: 128,
        speed: 1,
    },
    {
        maxHealth: 2,
        size: 128,
        speed: 2,
    },
    {
        maxHealth: 8,
        size: 64,
        speed: 3.2,
    },
    {
        maxHealth: 12,
        size: 64,
        speed: 3.2,
    },
    {
        maxHealth: 32,
        size: 64,
        speed: 4,
    },

    {
        maxHealth: 1,
        size: 48,
        speed: 6,
    },
    {
        maxHealth: 128,
        size: 32,
        speed: 2,
    },
    {
        maxHealth: 4,
        size: 32,
        speed: 8,
    },
    {
        maxHealth: 1,
        size: 4,
        speed: 0.2,
    },
    {
        maxHealth: 99999,
        size: 216,
        speed: 6,
    },
];
export const bulletTypes = [
    {
        name: "handgun",
        velocity: 1200,
        velocityDamp: 1,
        reloadTime: 0.5,
        despawnTime: 2,
        damage: 1,
        size: 16,
    },
    {
        name: "cannon",
        velocity: 1600,
        velocityDamp: 0.97,
        reloadTime: 8,
        despawnTime: 32,
        damage: 8,
        size: 128,
    },
    {
        name: "pink mine",
        velocity: 400,
        velocityDamp: 0.5,
        reloadTime: 2.1,
        despawnTime: 600,
        damage: 3,
        size: 32,
    },
    {
        name: "accel",
        velocity: 100,
        velocityDamp: 1.01,
        reloadTime: 3.2,
        despawnTime: 32,
        damage: 12,
        size: 128,
    },
];

export const input = [0, 0];
export const direction = [1, 0];
export const position = [0, 0];

const sprites = {
    player: new Image(),
    enemies: [],
    bullets: [],
};
sprites.player.src = "sprites/players/player/image.png";
for (let type = 0; type < enemyTypes.length; type++) {
    sprites.enemies[type] = new Image();
    sprites.enemies[type].src = `sprites/monsters/monster_${type}/image.png`;
    sprites.enemies[type]._hx = enemyTypes[type].size / 2;
    sprites.enemies[type]._hy = enemyTypes[type].size / 2;
}
for (let i = 0; i < bulletTypes.length; i++) {
    sprites.bullets[i] = new Image();
    sprites.bullets[i].src = `sprites/bullets/bullet_${i}/image.png`;
    sprites.bullets[i]._hx = sprites.bullets[i].naturalWidth / 2;
    sprites.bullets[i]._hy = sprites.bullets[i].naturalHeight / 2;
}
export { sprites };

export const enemies = new Soa({
    state: Uint8Array,
    type: Uint8Array,
    x: Float64Array,
    y: Float64Array,
    inViewport: Uint8Array,
}, ENEMIES_COUNT_MAX);

export const bullets = new Soa({
    state: Float32Array,
    type: Uint8Array,
    x: Float64Array,
    y: Float64Array,
    vx: Float64Array,
    vy: Float64Array,
    velocityDamp: Float64Array,
    inViewport: Uint8Array,
}, ENEMIES_COUNT_MAX);

export const progressMilestones = [
    0,
    10,
    20,
    25,
    30,
    50,
    60,

    2 * 60,
    4 * 60,
    10 * 60,
    12 * 60,
    18 * 60,
    24 * 60,
    30 * 60,
    40 * 60,
];
export const progressMilestonesEnemies = [
    [0],
    [0, 0, 1],
    [0, 1],
    [1],
    [0, 1, 1],
    [2],
    [0, 2],

    [1, 2],
    [0, 1, 2, 3],
    [2, 3],
    [3],
    [3, 4, 5],
    [0, 6, 7, 8],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [9],
];

export const progressMilestonesSpawnIntervals = [
    2,
    1,
    2,
    3,
    2,
    1,
    2,

    2,
    1,
    3,
    3,
    2,
    2,
    1,
    1,
];
export const progressMilestonesWeaponChance = [
    0,
    0,
    0.1,
    1,
    0,
    0.1,
    0,

    0.1,
    1,
    0.1,
    0.1,
    1.1,
    0.1,
    0.1,
    0.1,
];