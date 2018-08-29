"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wrd = require("./word");
const child_process_1 = require("child_process");
const path = require("path");
const FUTURE_DELAY_MAX = 2000;
const concrete = (values, then) => {
    if (values.some(value => value instanceof Promise)) {
        return Promise.all(values).then(then);
    }
    else {
        return then(values);
    }
};
class EvalEnv {
    constructor(label, term) {
        this.label = label;
        this.term = term;
    }
    toString() {
        return `\n\t{${this.label} -> ${this.term}}`;
    }
}
class Term {
    constructor() {
        this.name = Term.name;
    }
    evaluate() {
        return this;
    }
    addEnv(...env) {
    }
    toString() {
        return '<None>';
    }
    static fromObject(term) {
        switch (term.name) {
            case Term.name: throw new Error('fuzzy term');
            case Variable.name: return Variable.fromObject(term);
            case Primitive.name: return Primitive.fromObject(term);
            case Value.name: return Value.fromObject(term);
            case Lambda.name: return Lambda.fromObject(term);
            case Pair.name: return Pair.fromObject(term);
            case PairCar.name: return PairCar.fromObject(term);
            case PairCdr.name: return PairCdr.fromObject(term);
            case Application.name: return Application.fromObject(term);
            case Future.name: return Future.fromObject(term);
        }
    }
}
exports.Term = Term;
class Variable extends Term {
    constructor(label, term) {
        super();
        this.name = Variable.name;
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
        console.log('evaluate<Variable>:', this.toString(), '=>', this.term.toString());
        return this.term;
    }
    toString() {
        return this.label;
    }
    static fromObject(term) {
        return new Variable(term.label, term.term && Term.fromObject(term.term));
    }
}
exports.Variable = Variable;
class Primitive extends Term {
    constructor(str, func) {
        super();
        this.name = Primitive.name;
        this.str = str;
        this.func = func;
    }
    addEnv(...env) {
        return;
    }
    evaluate() {
        console.log('evaluate<Primitive>:', this.toString());
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
        this.name = Value.name;
        this.value = value;
    }
    addEnv(...env) {
        return;
    }
    evaluate() {
        console.log('evaluate<Value>:', this.toString());
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
        this.name = Lambda.name;
        this.arg = arg;
        this.body = body;
    }
    addEnv(...env) {
        this.body.addEnv(...env);
    }
    evaluate() {
        console.log('evaluate<Lambda>:', this.toString());
        return this;
    }
    toString() {
        return `(λ${this.arg}.${this.body})`;
    }
    static fromObject(term) {
        return new Lambda(Variable.fromObject(term.arg), Term.fromObject(term.body));
    }
}
exports.Lambda = Lambda;
class Pair extends Term {
    constructor(car, cdr) {
        super();
        this.name = Pair.name;
        this.car = car;
        this.cdr = cdr;
    }
    addEnv(...env) {
        this.car.addEnv(...env);
        this.cdr.addEnv(...env);
    }
    evaluate() {
        console.log('evaluate<Pair>:', this.toString());
        const car = this.car.evaluate();
        const cdr = this.cdr.evaluate();
        const result = concrete([car, cdr], ([car, cdr]) => new Pair(car, cdr));
        return result;
    }
    toString() {
        return `(${this.car}, ${this.cdr})`;
    }
    static fromObject(term) {
        return new Pair(Term.fromObject(term.car), Term.fromObject(term.cdr));
    }
}
exports.Pair = Pair;
class PairCar extends Term {
    constructor(pair) {
        super();
        this.name = PairCar.name;
        this.pair = pair;
    }
    addEnv(...env) {
        this.pair.addEnv(...env);
    }
    evaluate() {
        console.log('evaluate<PairCar>:', this.toString());
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
        return new PairCar(Term.fromObject(term.pair));
    }
}
exports.PairCar = PairCar;
class PairCdr extends Term {
    constructor(pair) {
        super();
        this.name = PairCdr.name;
        this.pair = pair;
    }
    addEnv(...env) {
        this.pair.addEnv(...env);
    }
    evaluate() {
        console.log('evaluate<PairCar>:', this.toString());
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
        return new PairCdr(Term.fromObject(term.pair));
    }
}
exports.PairCdr = PairCdr;
class Application extends Term {
    constructor(abs, arg) {
        super();
        this.name = Application.name;
        this.abs = abs;
        this.arg = arg;
    }
    addEnv(...env) {
        this.abs.addEnv(...env);
        this.arg.addEnv(...env);
    }
    evaluate() {
        const before = this.toString();
        console.log('evaluate<Application>:', before);
        super.evaluate();
        const abs = this.abs.evaluate();
        const arg = this.arg.evaluate();
        console.log('applicating of', abs.toString(), 'with', arg.toString(), 'from', before);
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
            console.log('result<Application> of', before, ': \n\t', result.toString());
            return result;
        });
    }
    toString() {
        return `(${this.abs} ${this.arg})`;
    }
    static fromObject(term) {
        return new Application(Term.fromObject(term.abs), Term.fromObject(term.arg));
    }
}
exports.Application = Application;
class Future extends Term {
    constructor(term) {
        super();
        this.name = Future.name;
        this.term = term;
    }
    addEnv(...env) {
        this.term.addEnv(...env);
    }
    evaluate() {
        console.log('evaluate<Future>:', this.toString());
        const child = child_process_1.fork(path.join(__dirname, './child'));
        child.on('error', (e) => {
            console.error('<!> error in child process:', e);
            throw e;
        });
        return new Promise((resolve, reject) => {
            child.on('message', ({ term: evaluated, error }) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(Term.fromObject(evaluated));
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
        return new Future(Term.fromObject(term.term));
    }
}
exports.Future = Future;
