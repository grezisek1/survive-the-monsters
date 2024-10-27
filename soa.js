export default class Soa {
    data;
    #usage;
    #largestId;
    constructor(structure, maxLength) {
        this.maxLength = maxLength;

        this.data = {};
        this.#usage = new Uint8Array(maxLength);
        this.#largestId = -1;
        for (let [key, Type] of Object.entries(structure)) {
            this.data[key] = new Type(maxLength);
        }
        Object.freeze(this.data);
    }

    add(item) {
        const result = {
            id: -1,
            justReachedFull: false,
        };
        if (this.#largestId == this.maxLength) {
            return result;
        }

        result.id = this.#largestId + 1;
        for (let id = 0; id < result.id; id++) {
            if (!this.#usage[id]) {
                result.id = id;
                break;
            }
        }

        this.#largestId = Math.max(this.#largestId, result.id);
        if (this.#largestId == this.maxLength) {
            result.justReachedFull = true;
        }
        this.#usage[result.id] = 1;
        for (let key of Object.keys(this.data)) {
            this.data[key][result.id] = item[key];
        }

        return result;
    }
    remove(itemId) {
        const result = {
            removed: false,
            justReachedEmpty: false,
        };
        if (!this.#usage[itemId]) {
            return result;
        }
        
        this.#usage[itemId] = 0;
        for (let key of Object.keys(this.data)) {
            this.data[key][itemId] = 0;
        }
        result.removed = true;
    
        if (itemId != this.#largestId) {
            return result;
        }
        
        if (this.#largestId == 0) {
            result.justReachedEmpty = true;
            this.#largestId = -1;
            return result;
        }

        for (let id = this.#largestId - 1; id >= 0; id--) {
            if (!this.#usage[id]) {
                continue;
            }
            this.#largestId = id;
            break;
        }
        return result;
    }
    iterate(callback, arg) {
        for (let id = 0; id <= this.#largestId; id++) {
            if (!this.#usage[id]) {
                continue;
            }
            callback(id, this.data, arg);
        }
    }
    reset() {
        for (let key of Object.keys(this.data)) {
            this.data[key].fill(0);
        }
        this.#usage.fill(0);
        this.#largestId = -1;
    }
}