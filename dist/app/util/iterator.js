"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Iterator {
    constructor(array) {
        this.array = array;
    }
    next() {
        return this.array.shift();
    }
    peek() {
        return this.array[0];
    }
}
exports.default = Iterator;
