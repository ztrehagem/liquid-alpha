"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typ = require("./type");
const wrd = require("./word");
const clt = require("./clterm");
const type_env_1 = require("./type-env");
class Term {
    constructor(type = null) {
        this.type = type;
    }
    checkType(env = []) {
        return this.type;
    }
    compile() {
        return new clt.Term();
    }
    get size() {
        return 1;
    }
}
exports.Term = Term;
class Variable extends Term {
    constructor(label) {
        super();
        this.label = label;
    }
    checkType(env = []) {
        const { type } = env.find(({ label, type }) => label === this.label);
        return this.type = type;
    }
    compile() {
        return new clt.Variable(this.label);
    }
    get size() {
        return 1;
    }
}
exports.Variable = Variable;
class Primitive extends Term {
    constructor(str, type) {
        super(type);
        this.str = str;
    }
    checkType(env = []) {
        return this.type;
    }
    compile() {
        switch (this) {
            case Primitive.AND: return clt.Primitive.AND;
            case Primitive.NOT: return clt.Primitive.NOT;
            default: return null;
        }
    }
    get size() {
        return 1;
    }
}
Primitive.AND = new Primitive(wrd.AND, new typ.FunType(new typ.PairType(typ.BOOL, typ.BOOL), typ.BOOL));
Primitive.NOT = new Primitive(wrd.NOT, new typ.FunType(typ.BOOL, typ.BOOL));
exports.Primitive = Primitive;
class Value extends Term {
    constructor(str, type) {
        super(type);
        this.str = str;
    }
    checkType(env = []) {
        return this.type;
    }
    compile() {
        switch (this.type) {
            case typ.BOOL: return new clt.Value(this.str === wrd.TRUE);
            case typ.NUMBER: return new clt.Value(parseFloat(this.str));
            default: return null;
        }
    }
    get size() {
        return 1;
    }
}
Value.TRUE = new Value(wrd.TRUE, typ.BOOL);
Value.FALSE = new Value(wrd.FALSE, typ.BOOL);
exports.Value = Value;
class Let extends Term {
    constructor(arg, bound, body) {
        super();
        this.arg = arg;
        this.bound = bound;
        this.body = body;
    }
    checkType(env = []) {
        const boundType = this.bound.checkType(env);
        const newEnv = new type_env_1.default(this.arg.label, boundType);
        return this.type = this.body.checkType([newEnv, ...env]);
    }
    compile() {
        const abs = new clt.Lambda(this.arg.compile(), this.body.compile());
        return new clt.Application(abs, this.bound.compile());
    }
    get size() {
        return this.bound.size + this.body.size + 1;
    }
}
exports.Let = Let;
class Fun extends Term {
    constructor(arg, argType, body) {
        super();
        this.arg = arg;
        this.argType = argType;
        this.body = body;
    }
    checkType(env = []) {
        const newEnv = new type_env_1.default(this.arg.label, this.argType);
        const bodyType = this.body.checkType([newEnv, ...env]);
        return this.type = new typ.FunType(this.argType, bodyType);
    }
    compile() {
        return new clt.Lambda(this.arg.compile(), this.body.compile());
    }
    get size() {
        return this.body.size + 1;
    }
}
exports.Fun = Fun;
class AsyncFun extends Fun {
    constructor(arg, argType, body) {
        super(arg, argType, body);
    }
    checkType(env = []) {
        const newEnv = new type_env_1.default(this.arg.label, this.argType);
        const bodyType = this.body.checkType([newEnv, ...env]);
        return this.type = new typ.AsyncFunType(this.argType, bodyType);
    }
}
exports.AsyncFun = AsyncFun;
class Pair extends Term {
    constructor(car, cdr) {
        super();
        this.car = car;
        this.cdr = cdr;
    }
    checkType(env = []) {
        const carType = this.car.checkType(env);
        const cdrType = this.cdr.checkType(env);
        return this.type = new typ.PairType(carType, cdrType);
    }
    compile() {
        return new clt.Pair(this.car.compile(), this.cdr.compile());
    }
    get size() {
        return this.car.size + this.cdr.size + 1;
    }
}
exports.Pair = Pair;
class PairCar extends Term {
    constructor(pair) {
        super();
        this.pair = pair;
    }
    checkType(env = []) {
        const pairType = this.pair.checkType(env);
        if (!(pairType instanceof typ.PairType))
            throw new Error(`type error: expected PairType but got "${pairType}"`);
        return this.type = pairType.car;
    }
    compile() {
        return new clt.PairCar(this.pair.compile());
    }
    get size() {
        return this.pair.size + 1;
    }
}
exports.PairCar = PairCar;
class PairCdr extends Term {
    constructor(pair) {
        super();
        this.pair = pair;
    }
    checkType(env = []) {
        const pairType = this.pair.checkType(env);
        if (!(pairType instanceof typ.PairType))
            throw new Error(`type error: expected PairType but got "${pairType}"`);
        return this.type = pairType.cdr;
    }
    compile() {
        return new clt.PairCdr(this.pair.compile());
    }
    get size() {
        return this.pair.size + 1;
    }
}
exports.PairCdr = PairCdr;
class Application extends Term {
    constructor(abs, arg) {
        super();
        this.abs = abs;
        this.arg = arg;
    }
    checkType(env = []) {
        const absType = this.abs.checkType(env);
        const argType = this.arg.checkType(env);
        if (!(absType instanceof typ.FunType))
            throw new Error(`type error: expected FunType but got "${absType}"`);
        if (!absType.def.equalTo(argType))
            throw new Error(`type error: expected "${absType.def}" but got "${argType}"`);
        return this.type = absType.dom;
    }
    compile() {
        const app = new clt.Application(this.abs.compile(), this.arg.compile());
        return (this.abs.type instanceof typ.AsyncFunType) ? new clt.Future(app) : app;
    }
    get size() {
        return this.abs.size + this.arg.size + 1;
    }
}
exports.Application = Application;
