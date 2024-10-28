import Soa from "./soa.js";

export const PHYSICS_FPS = 60;
export const SCENE_WIDTH = 1920;
export const SCENE_HEIGHT = 1080;
export const SPRITE_SIZE = 128;
export const ENEMIES_COUNT_MAX = 2**8;
export const BULLETS_COUNT_MAX = 2**8;
export const TIME_MAX = 60 * 30;
export const ENEMY_SPAWN_INTERVAL = 2;
export const BULLET_SPAWN_INTERVAL = 1;

export const movementConfig = {
    playerSpeed: 5,
    enemiesSpeed: 1,
    bulletsInitialVelocity: 1200,
    velocityDamp: 0.99,
};
export const enemyTypes = [
    {
        maxHealth: 2,
        size: 128,
    },
    {
        maxHealth: 2,
        size: 128,
    }
];
export const bulletTypes = [
    {
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
    state: Uint8Array,
    type: Uint8Array,
    x: Float64Array,
    y: Float64Array,
    vx: Float64Array,
    vy: Float64Array,
}, ENEMIES_COUNT_MAX);

export const progressMilestones = [
    0,
    60 * 5,
    60 * 10,
    60 * 20,
    60 * 25,
    60 * 28,
];