"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wrd = require("./word");
class Type {
    constructor(str = null) {
        this.str = str;
    }
    equalTo(type) {
        return type.str === this.str;
    }
    toString() {
        return this.str;
    }
}
exports.Type = Type;
class PairType extends Type {
    constructor(car, cdr) {
        super();
        this.car = car;
        this.cdr = cdr;
    }
    equalTo(type) {
        return (type instanceof PairType) && type.car.equalTo(this.car) && type.cdr.equalTo(this.cdr);
    }
    toString() {
        return `(${this.car}, ${this.cdr})`;
    }
}
exports.PairType = PairType;
class FunType extends Type {
    constructor(def, dom) {
        super();
        this.def = def;
        this.dom = dom;
    }
    equalTo(type) {
        return (type instanceof FunType) && type.def.equalTo(this.def) && type.dom.equalTo(this.dom);
    }
    get arrowStr() {
        return '->';
    }
    toString() {
        const defStr = this.def instanceof FunType ? `(${this.def})` : this.def.toString();
        return `${defStr} ${this.arrowStr} ${this.dom}`;
    }
}
exports.FunType = FunType;
class AsyncFunType extends FunType {
    equalTo(type) {
        return (type instanceof AsyncFunType) && super.equalTo(type);
    }
    get arrowStr() {
        return '->a';
    }
}
exports.AsyncFunType = AsyncFunType;
exports.BOOL = new Type(wrd.BOOL);
exports.NUMBER = new Type(wrd.NUMBER);
