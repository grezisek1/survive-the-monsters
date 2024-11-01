export default class Grid {
    constructor(cellSize, halfSize) {
        this.cellSize = cellSize;
        this.halfSize = halfSize;
        this.grid = {};
        for (let gy = -halfSize; gy < halfSize; gy++) {
            this.grid[gy] = {};
            for (let gx = -halfSize; gx < halfSize; gx++) {
                this.grid[gy][gx] = [];
            }
        }
    }
    add(val, x, y) {
        const gx = Math.floor(x / this.cellSize);
        const gy = Math.floor(y / this.cellSize);
        this.grid[gy][gx].push(val);
    }
    remove(val, x, y) {
        const gx = Math.floor(x / this.cellSize);
        const gy = Math.floor(y / this.cellSize);
        if (this.grid[gy][gx].length == 0) {
            return;
        }
        const index = this.grid[gy][gx].indexOf(val);
        if (index > -1) {
            this.grid[gy][gx].splice(index, 1);
        }
    }
    iterate(callback, arg) {
        for (let gy = -halfSize; gy < halfSize; gy++) {
            for (let gx = -halfSize; gx < halfSize; gx++) {
                const cell = this.grid[gy][gx];
                for (let gi = 0; gi < cell.length; gi++) {
                    callback(gx, gy, gi, cell, cell[gi], arg);
                }
            }
        }
    }
    iterateCells(callback, arg) {
        for (let gy = -halfSize; gy < halfSize; gy++) {
            for (let gx = -halfSize; gx < halfSize; gx++) {
                callback(gx, gy, cell, arg);
            }
        }
    }
    reset() {
        for (let gy = -halfSize; gy < halfSize; gy++) {
            for (let gx = -halfSize; gx < halfSize; gx++) {
                this.grid[gy][gx].length = 0;
            }
        }
    }
}