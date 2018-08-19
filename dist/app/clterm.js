"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Term {
}
exports.Term = Term;
class Variable extends Term {
    constructor(label) {
        super();
        this.label = label;
    }
}
exports.Variable = Variable;
class Primitive extends Term {
}
Primitive.AND = new Primitive();
Primitive.NOT = new Primitive();
exports.Primitive = Primitive;
class Literal extends Term {
    constructor(value) {
        super();
        this.value = value;
    }
}
Literal.TRUE = new Literal(true);
Literal.FALSE = new Literal(false);
exports.Literal = Literal;
class Lambda extends Term {
    constructor(arg, body) {
        super();
        this.arg = arg;
        this.body = body;
    }
}
exports.Lambda = Lambda;
class Pair extends Term {
    constructor(car, cdr) {
        super();
        this.car = car;
        this.cdr = cdr;
    }
}
exports.Pair = Pair;
class PairCar extends Term {
    constructor(pair) {
        super();
        this.pair = pair;
    }
}
exports.PairCar = PairCar;
class PairCdr extends Term {
    constructor(pair) {
        super();
        this.pair = pair;
    }
}
exports.PairCdr = PairCdr;
class Application extends Term {
    constructor(abs, arg) {
        super();
        this.abs = abs;
        this.arg = arg;
    }
}
exports.Application = Application;
class Future extends Term {
    constructor(term) {
        super();
        this.term = term;
    }
}
exports.Future = Future;
