"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wrd = require("./word");
const FUTURE_DELAY_MAX = 2000;
const concrete = (values, then) => {
    if (values.some(value => value instanceof Promise)) {
        console.log('!!found Promise in:', values.toString());
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
        return `\n\t{${this.label} -> ${this.term} : ${this.term.env.map(e => e.label).join(',')}}`;
    }
}
class Term {
    constructor() {
        this.env = [];
        this.promise = null;
    }
    evaluate() {
        return this;
    }
    addEnv(...env) {
        this.env.unshift(...env);
    }
    toString() {
        return '<None>';
    }
}
exports.Term = Term;
class Variable extends Term {
    constructor(label) {
        super();
        this.label = label;
    }
    addEnv(...env) {
        super.addEnv(...env);
    }
    evaluate() {
        console.log('evaluate<Variable>:', this.toString());
        const env = this.env.find(env => env.label === this.label);
        if (!env) {
            throw new Error(`runtime error: given no bindings for "${this.label}" in environment ${this.env}`);
        }
        return env.term;
    }
    toString() {
        return this.label;
    }
}
exports.Variable = Variable;
class Primitive extends Term {
    constructor(str, func) {
        super();
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
}
Primitive.AND = new Primitive(wrd.AND, (arg) => {
    if (!(arg instanceof Pair) || [arg.car, arg.cdr].some(t => t !== Value.TRUE && t !== Value.FALSE)) {
        throw new Error(`runtime error: expected (<Bool>, <Bool>) but got ${arg}`);
    }
    return (arg.car === Value.TRUE && arg.cdr === Value.TRUE) ? Value.TRUE : Value.FALSE;
});
Primitive.NOT = new Primitive(wrd.NOT, (arg) => {
    if (!(arg instanceof Value) || [Value.TRUE, Value.FALSE].every(v => v !== arg)) {
        throw new Error(`runtime error: expected <Bool> but got ${arg}`);
    }
    return arg === Value.TRUE ? Value.FALSE : Value.TRUE;
});
exports.Primitive = Primitive;
class Value extends Term {
    constructor(value) {
        super();
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
}
Value.TRUE = new Value(true);
Value.FALSE = new Value(false);
exports.Value = Value;
class Lambda extends Term {
    constructor(arg, body) {
        super();
        this.arg = arg;
        this.body = body;
    }
    addEnv(...env) {
        super.addEnv(...env);
        this.body.addEnv(...env);
    }
    evaluate() {
        console.log('evaluate<Lambda>:', this.toString());
        return this;
    }
    toString() {
        return `(λ${this.arg}.${this.body})`;
    }
}
exports.Lambda = Lambda;
class Pair extends Term {
    constructor(car, cdr) {
        super();
        this.car = car;
        this.cdr = cdr;
    }
    addEnv(...env) {
        super.addEnv(...env);
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
}
exports.Pair = Pair;
class PairCar extends Term {
    constructor(pair) {
        super();
        this.pair = pair;
    }
    addEnv(...env) {
        super.addEnv(...env);
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
}
exports.PairCar = PairCar;
class PairCdr extends Term {
    constructor(pair) {
        super();
        this.pair = pair;
    }
    addEnv(...env) {
        super.addEnv(...env);
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
}
exports.PairCdr = PairCdr;
class Application extends Term {
    constructor(abs, arg) {
        super();
        this.abs = abs;
        this.arg = arg;
    }
    addEnv(...env) {
        super.addEnv(...env);
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
                console.log('application env:', abs.body.env.toString());
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
}
exports.Application = Application;
class Future extends Term {
    constructor(term) {
        super();
        this.term = term;
    }
    addEnv(...env) {
        super.addEnv(...env);
        this.term.addEnv(...env);
    }
    evaluate() {
        console.log('evaluate<Future>:', this.toString());
        return new Promise((resolve) => {
            if (!FUTURE_DELAY_MAX) {
                resolve(this.term.evaluate());
            }
            else {
                const delay = Math.floor(Math.random() * FUTURE_DELAY_MAX);
                setTimeout(() => resolve(this.term.evaluate()), delay);
            }
        });
    }
    toString() {
        return `(future ${this.term})`;
    }
}
exports.Future = Future;
