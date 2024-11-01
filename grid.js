export default class Grid {
    static nbhdOffsets = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [0, 0] , [1, 0],
        [-1, 1], [0, 1], [1, 1],
    ];
    constructor(halfSize) {
        this.halfSize = halfSize;
        this.grid = {};
        this.nbhd = {};
        for (let gy = -halfSize; gy < halfSize; gy++) {
            this.grid[gy] = {};
            this.nbhd[gy] = {};
            for (let gx = -halfSize; gx < halfSize; gx++) {
                this.grid[gy][gx] = [];
                this.nbhd[gy][gx] = [];
            }
        }
        for (let gy = -halfSize; gy < halfSize; gy++) {
            for (let gx = -halfSize; gx < halfSize; gx++) {
                for (let [ox, oy] of Grid.nbhdOffsets) {
                    if (!this.grid[gy+oy]?.[gx+ox]) {
                        continue;
                    }
                    this.nbhd[gy][gx].push(this.grid[gy+oy][gx+ox]);
                }
            }
        }
    }
    add(val, gx, gy) {
        this.grid[gy][gx].push(val);
    }
    remove(val, gx, gy) {
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