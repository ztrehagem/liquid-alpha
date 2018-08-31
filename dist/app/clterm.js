"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const wrd = require("./word");
const child_process_1 = require("child_process");
const path = require("path");
const FUTURE_DELAY_MAX = 2000;
class EvalEnv {
    constructor(label, term) {
        this.label = label;
        this.term = term;
    }
    toString() {
        return `\n\t{${this.label} -> ${this.term}}`;
    }
}
var Kind;
(function (Kind) {
    Kind[Kind["Term"] = 0] = "Term";
    Kind[Kind["Variable"] = 1] = "Variable";
    Kind[Kind["Primitive"] = 2] = "Primitive";
    Kind[Kind["Value"] = 3] = "Value";
    Kind[Kind["Lambda"] = 4] = "Lambda";
    Kind[Kind["Pair"] = 5] = "Pair";
    Kind[Kind["PairCar"] = 6] = "PairCar";
    Kind[Kind["PairCdr"] = 7] = "PairCdr";
    Kind[Kind["Application"] = 8] = "Application";
    Kind[Kind["Future"] = 9] = "Future";
})(Kind || (Kind = {}));
exports.fromObject = (obj) => {
    switch (obj.kind) {
        case Kind.Variable: return Variable.fromObject(obj);
        case Kind.Primitive: return Primitive.fromObject(obj);
        case Kind.Value: return Value.fromObject(obj);
        case Kind.Lambda: return Lambda.fromObject(obj);
        case Kind.Pair: return Pair.fromObject(obj);
        case Kind.PairCar: return PairCar.fromObject(obj);
        case Kind.PairCdr: return PairCdr.fromObject(obj);
        case Kind.Application: return Application.fromObject(obj);
        case Kind.Future: return Future.fromObject(obj);
        default: throw new Error('cannot parse clterm');
    }
};
const concrete = (values, then) => {
    if (values.some(value => value instanceof Promise)) {
        return Promise.all(values).then(then);
    }
    else {
        return then(values);
    }
};
class Term {
    constructor() {
        this.kind = Kind.Term;
    }
    evaluate() {
        return this;
    }
    addEnv(...env) {
    }
    toString() {
        return '<None>';
    }
}
exports.Term = Term;
class Variable extends Term {
    constructor(label, term) {
        super();
        this.kind = Kind.Variable;
        this.label = label;
        this.term = term;
    }
    addEnv(...envs) {
        const env = envs.find(env => env.label === this.label);
        this.term = env ? env.term : this.term;
    }
    evaluate() {
        if (!this.term) {
            throw new Error(`runtime error: given no bindings for "${this.label}"`);
        }
        logger_1.log('evaluate<Variable>:', this.toString(), '=>', this.term.toString());
        return this.term;
    }
    toString() {
        return this.label;
    }
    static fromObject(term) {
        return new Variable(term.label, term.term && exports.fromObject(term.term));
    }
}
exports.Variable = Variable;
class Primitive extends Term {
    constructor(str, func) {
        super();
        this.kind = Kind.Primitive;
        this.str = str;
        this.func = func;
    }
    addEnv(...env) {
        return;
    }
    evaluate() {
        logger_1.log('evaluate<Primitive>:', this.toString());
        return this;
    }
    toString() {
        return this.str;
    }
    static fromObject(term) {
        switch (term.str) {
            case wrd.AND: return Primitive.AND;
            case wrd.NOT: return Primitive.NOT;
        }
    }
}
Primitive.AND = new Primitive(wrd.AND, (arg) => {
    if (!(arg instanceof Pair && arg.car instanceof Value && arg.cdr instanceof Value)) {
        throw new Error(`runtime error: expected (<Value>, <Value>) but got ${arg}`);
    }
    return (arg.car.value && arg.cdr.value) ? new Value(true) : new Value(false);
});
Primitive.NOT = new Primitive(wrd.NOT, (arg) => {
    if (!(arg instanceof Value)) {
        throw new Error(`runtime error: expected <Value> but got ${arg}`);
    }
    return arg.value === true ? new Value(false) : new Value(true);
});
exports.Primitive = Primitive;
class Value extends Term {
    constructor(value) {
        super();
        this.kind = Kind.Value;
        this.value = value;
    }
    addEnv(...env) {
        return;
    }
    evaluate() {
        logger_1.log('evaluate<Value>:', this.toString());
        return this;
    }
    toString() {
        return this.value.toString();
    }
    static fromObject(term) {
        return new Value(term.value);
    }
}
exports.Value = Value;
class Lambda extends Term {
    constructor(arg, body) {
        super();
        this.kind = Kind.Lambda;
        this.arg = arg;
        this.body = body;
    }
    addEnv(...env) {
        this.body.addEnv(...env);
    }
    evaluate() {
        logger_1.log('evaluate<Lambda>:', this.toString());
        return this;
    }
    toString() {
        return `(λ${this.arg}.${this.body})`;
    }
    static fromObject(term) {
        return new Lambda(Variable.fromObject(term.arg), exports.fromObject(term.body));
    }
}
exports.Lambda = Lambda;
class Pair extends Term {
    constructor(car, cdr) {
        super();
        this.kind = Kind.Pair;
        this.car = car;
        this.cdr = cdr;
    }
    addEnv(...env) {
        this.car.addEnv(...env);
        this.cdr.addEnv(...env);
    }
    evaluate() {
        logger_1.log('evaluate<Pair>:', this.toString());
        const car = this.car.evaluate();
        const cdr = this.cdr.evaluate();
        const result = concrete([car, cdr], ([car, cdr]) => new Pair(car, cdr));
        return result;
    }
    toString() {
        return `(${this.car}, ${this.cdr})`;
    }
    static fromObject(term) {
        return new Pair(exports.fromObject(term.car), exports.fromObject(term.cdr));
    }
}
exports.Pair = Pair;
class PairCar extends Term {
    constructor(pair) {
        super();
        this.kind = Kind.PairCar;
        this.pair = pair;
    }
    addEnv(...env) {
        this.pair.addEnv(...env);
    }
    evaluate() {
        logger_1.log('evaluate<PairCar>:', this.toString());
        const pair = this.pair.evaluate();
        return concrete([pair], ([pair]) => {
            if (!(pair instanceof Pair)) {
                throw new Error(`runtime error: expected <Pair> but got ${pair}`);
            }
            else {
                return pair.car;
            }
        });
    }
    toString() {
        return `${this.pair}.1`;
    }
    static fromObject(term) {
        return new PairCar(exports.fromObject(term.pair));
    }
}
exports.PairCar = PairCar;
class PairCdr extends Term {
    constructor(pair) {
        super();
        this.kind = Kind.PairCdr;
        this.pair = pair;
    }
    addEnv(...env) {
        this.pair.addEnv(...env);
    }
    evaluate() {
        logger_1.log('evaluate<PairCar>:', this.toString());
        const pair = this.pair.evaluate();
        return concrete([pair], ([pair]) => {
            if (!(pair instanceof Pair)) {
                throw new Error(`runtime error: expected <Pair> but got ${pair}`);
            }
            return pair.cdr;
        });
    }
    toString() {
        return `${this.pair}.2`;
    }
    static fromObject(term) {
        return new PairCdr(exports.fromObject(term.pair));
    }
}
exports.PairCdr = PairCdr;
class Application extends Term {
    constructor(abs, arg) {
        super();
        this.kind = Kind.Application;
        this.abs = abs;
        this.arg = arg;
    }
    addEnv(...env) {
        this.abs.addEnv(...env);
        this.arg.addEnv(...env);
    }
    evaluate() {
        const before = this.toString();
        logger_1.log('evaluate<Application>:', before);
        const abs = this.abs.evaluate();
        const arg = this.arg.evaluate();
        logger_1.log('applicating of', abs.toString(), 'with', arg.toString(), 'from', before);
        return concrete([abs, arg], ([abs, arg]) => {
            let result;
            if (abs instanceof Lambda) {
                const newEnv = new EvalEnv(abs.arg.label, arg);
                abs.body.addEnv(newEnv);
                result = abs.body.evaluate();
            }
            if (abs instanceof Primitive) {
                result = abs.func(arg);
            }
            logger_1.log('result<Application> of', before, ': \n\t', result.toString());
            return result;
        });
    }
    toString() {
        return `(${this.abs} ${this.arg})`;
    }
    static fromObject(term) {
        return new Application(exports.fromObject(term.abs), exports.fromObject(term.arg));
    }
}
exports.Application = Application;
class Future extends Term {
    constructor(term) {
        super();
        this.kind = Kind.Future;
        this.term = term;
    }
    addEnv(...env) {
        this.term.addEnv(...env);
    }
    evaluate() {
        logger_1.log('evaluate<Future>:', this.toString());
        ;
        const child = child_process_1.fork(path.join(__dirname, './child'));
        child.on('error', (e) => {
            logger_1.error('<!> error in child process:', e);
            throw e;
        });
        return new Promise((resolve, reject) => {
            child.on('message', ({ term: evaluated, error }) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(exports.fromObject(evaluated));
                }
            });
            const message = {
                term: this.term,
            };
            child.send(message);
        });
    }
    toString() {
        return `(future ${this.term})`;
    }
    static fromObject(term) {
        return new Future(exports.fromObject(term.term));
    }
}
exports.Future = Future;
