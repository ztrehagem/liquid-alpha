"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typ = require("./type");
const wrd = require("./word");
const type_rule_1 = require("./type-rule");
class Term {
    constructor(type = null) {
        this.type = type;
    }
    checkType(env = []) {
        return this.type;
    }
    compile() {
        return this;
    }
}
exports.Term = Term;
class Variable extends Term {
    constructor(label) {
        super();
        this.label = label.toString();
    }
    checkType(env = []) {
        const { type } = env.find(({ label, type }) => label === this.label);
        return this.type = type;
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
}
Primitive.AND = new Primitive(wrd.AND, new typ.FunType(new typ.PairType(typ.BOOL, typ.BOOL), typ.BOOL));
Primitive.NOT = new Primitive(wrd.NOT, new typ.FunType(typ.BOOL, typ.BOOL));
exports.Primitive = Primitive;
class Literal extends Term {
    constructor(str, type) {
        super(type);
        this.str = str;
    }
    checkType(env = []) {
        return this.type;
    }
}
Literal.TRUE = new Literal(wrd.TRUE, typ.BOOL);
Literal.FALSE = new Literal(wrd.FALSE, typ.BOOL);
exports.Literal = Literal;
class Let extends Term {
    constructor(arg, bound, body) {
        super();
        this.arg = arg;
        this.bound = bound;
        this.body = body;
    }
    checkType(env = []) {
        const boundType = this.bound.checkType(env);
        const newEnv = new type_rule_1.default(this.arg.label, boundType);
        return this.type = this.body.checkType([newEnv, ...env]);
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
        const newEnv = new type_rule_1.default(this.arg.label, this.argType);
        const bodyType = this.body.checkType([newEnv, ...env]);
        return this.type = new typ.FunType(this.argType, bodyType);
    }
}
exports.Fun = Fun;
class AsyncFun extends Fun {
    constructor(arg, argType, body) {
        super(arg, argType, body);
    }
    checkType(env = []) {
        const newEnv = new type_rule_1.default(this.arg.label, this.argType);
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
}
exports.Application = Application;
