import Soa from "./soa.js";

export const PHYSICS_FPS = 60;
export const PLAYER_SIZE = 128;
export const CELL_SIZE = 256;
export const MAP_BORDER = 8;
export const MAP_BORDER_PX = CELL_SIZE * MAP_BORDER;
export const ENEMIES_COUNT_MAX = 2**12;
export const BULLETS_COUNT_MAX = 2**14;

export const playerSpeed = 6;
export const enemyTypes = [
    {
        maxHealth: 1,
        size: 128,
        radius: 128/2,
        speed: 1,
    },
    {
        maxHealth: 2,
        size: 128,
        radius: 128/2,
        speed: 2,
    },
    {
        maxHealth: 8,
        size: 64,
        radius: 64/2,
        speed: 3.2,
    },
    {
        maxHealth: 12,
        size: 64,
        radius: 64/2,
        speed: 3.2,
    },
    {
        maxHealth: 32,
        size: 64,
        radius: 64/2,
        speed: 4,
    },

    {
        maxHealth: 1,
        size: 48,
        radius: 48/2,
        speed: 6,
    },
    {
        maxHealth: 128,
        size: 32,
        radius: 32/2,
        speed: 2,
    },
    {
        maxHealth: 4,
        size: 32,
        radius: 32/2,
        speed: 8,
    },
    {
        maxHealth: 1,
        size: 4,
        radius: 4/2,
        speed: 0.2,
    },
    {
        maxHealth: 99999,
        size: 216,
        radius: 216/2,
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
        radius: (16/2),
    },
    {
        name: "cannon",
        velocity: 1600,
        velocityDamp: 0.97,
        reloadTime: 8,
        despawnTime: 32,
        damage: 8,
        size: 128,
        radius: 128/2,
    },
    {
        name: "pink mine",
        velocity: 400,
        velocityDamp: 0.5,
        reloadTime: 2.1,
        despawnTime: 600,
        damage: 3,
        size: 32,
        radius: 32/2,
    },
    {
        name: "accel",
        velocity: 100,
        velocityDamp: 1.01,
        reloadTime: 3.2,
        despawnTime: 32,
        damage: 12,
        size: 96,
        radius: 96/2,
    },
];

export const input = [0, 0];
export const direction = [1, 0];
export const position = [0, 0];
export const gridPos = [0, 0];

const sprites = {
    player: new Image(),
    enemies: [],
    bullets: [],
};
sprites.player.src = "sprites/players/player/image.png";
sprites.player._hx = PLAYER_SIZE / 2;
sprites.player._hy = PLAYER_SIZE / 2;
for (let type = 0; type < enemyTypes.length; type++) {
    sprites.enemies[type] = new Image();
    sprites.enemies[type].src = `sprites/monsters/monster_${type}/image.png`;
    sprites.enemies[type]._hx = enemyTypes[type].radius;
    sprites.enemies[type]._hy = enemyTypes[type].radius;
}
for (let type = 0; type < bulletTypes.length; type++) {
    sprites.bullets[type] = new Image();
    sprites.bullets[type].src = `sprites/bullets/bullet_${type}/image.png`;
    sprites.bullets[type]._hx = bulletTypes[type].radius;
    sprites.bullets[type]._hy = bulletTypes[type].radius;
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