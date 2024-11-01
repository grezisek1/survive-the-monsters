export default class Grid {
    static nbhdOffsets = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [0, 0] , [1, 0],
        [-1, 1], [0, 1], [1, 1],
    ];
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
        for (let gy = -this.halfY; gy < this.halfY; gy++) {
            for (let gx = -this.halfX; gx < this.halfX; gx++) {
                const cell = this.grid[gy][gx];
                for (let gi = 0; gi < cell.length; gi++) {
                    callback(gx, gy, gi, cell, cell[gi], arg);
                }
            }
        }
    }
    iterateCells(callback, arg) {
        for (let gy = -this.halfY; gy < this.halfY; gy++) {
            for (let gx = -this.halfX; gx < this.halfX; gx++) {
                callback(gx, gy, cell, arg);
            }
        }
    }
    reset(halfX, halfY) {
        if (!this.grid) {
            this.grid = {};
            this.nbhd = {};
        }
        this.halfX = halfX;
        this.halfY = halfY;
        for (let gy = -halfY; gy < halfY; gy++) {
            if (this.grid[gy]) {
                for (let gx = -halfX; gx < halfX; gx++) {
                    this.grid[gy][gx].length = 0;
                    this.nbhd[gy][gx].length = 0;
                }
            } else {
                this.grid[gy] = {};
                this.nbhd[gy] = {};
                for (let gx = -halfX; gx < halfX; gx++) {
                    this.grid[gy][gx] = [];
                    this.nbhd[gy][gx] = [];
                }
            }
        }
        for (let gy = -halfY; gy < halfY; gy++) {
            for (let gx = -halfX; gx < halfX; gx++) {
                for (let [ox, oy] of Grid.nbhdOffsets) {
                    if (!this.grid[gy+oy]?.[gx+ox]) {
                        continue;
                    }
                    this.nbhd[gy][gx].push(this.grid[gy+oy][gx+ox]);
                }
            }
        }
    }
}