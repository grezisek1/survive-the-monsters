import Soa from "./soa.js";

export const PHYSICS_FPS = 60;
export const SCENE_WIDTH = 1920;
export const SCENE_HEIGHT = 1080;
export const SPRITE_SIZE = 128;
export const ENEMIES_COUNT_MAX = 2**8;
export const BULLETS_COUNT_MAX = 2**8;
export const ENEMY_SPAWN_INTERVAL = 1;

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
        reloadTime: 1,
        despawnTime: 2,
        damage: 2,
        size: 128,
    },
];

export const input = [0, 0];
export const direction = [1, 0];
export const position = [0, 0];

export const actors = {
    enemies: new Array(ENEMIES_COUNT_MAX),
    bullets: new Array(BULLETS_COUNT_MAX),
};

export const enemies = new Soa({
    state: Uint8Array,
    type: Uint8Array,
    x: Float64Array,
    y: Float64Array,
}, ENEMIES_COUNT_MAX);

export const bullets = new Soa({
    state: Float32Array,
    type: Uint8Array,
    x: Float64Array,
    y: Float64Array,
    vx: Float64Array,
    vy: Float64Array,
    velocityDamp: Float64Array,
}, ENEMIES_COUNT_MAX);

const gametimeScale = 0.1;

export const progressMilestones = [
    0,
    10 * gametimeScale,
    20 * gametimeScale,
    25 * gametimeScale,
    30 * gametimeScale,
    50 * gametimeScale,
    60 * gametimeScale,

    2 * 60 * gametimeScale,
    4 * 60 * gametimeScale,
    10 * 60 * gametimeScale,
    12 * 60 * gametimeScale,
    18 * 60 * gametimeScale,
    24 * 60 * gametimeScale,
    30 * 60 * gametimeScale,
    40 * 60 * gametimeScale,
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