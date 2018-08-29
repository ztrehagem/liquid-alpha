import * as wrd from './word';

const FUTURE_DELAY_MAX = 2000;

const concrete = (values: (Term | Promise<Term>)[], then: (results: Term[]) => Term | Promise<Term>) => {
  if (values.some(value => value instanceof Promise)) {
    console.log('!!found Promise in:', values.toString());
    return Promise.all(values).then(then);
  } else {
    return then(<Term[]>values);
  }
}

class EvalEnv {
  label: string;
  term: Term;

  constructor(label: string, term: Term) {
    this.label = label;
    this.term = term;
  }

  toString() {
    return `\n\t{${this.label} -> ${this.term} : ${this.term.env.map(e => e.label).join(',')}}`;
  }
} 

export class Term {
  env: EvalEnv[] = [];
  promise: Promise<Term> = null;

  evaluate(): Term | Promise<Term> {
    return <Term>this;
  }

  addEnv(...env: EvalEnv[]) {
    // console.log('addEnv:', this.toString(), env.toString());
    this.env.unshift(...env);
  }

  toString() {
    return '<None>';
  }
}

export class Variable extends Term {
  label: string;

  constructor(label: string) {
    super();
    this.label = label;
  }

  addEnv(...env: EvalEnv[]) {
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

export class Primitive extends Term {
  static AND = new Primitive(wrd.AND, (arg: Term) => {
    if (!(arg instanceof Pair) || [arg.car, arg.cdr].some(t => t !== Value.TRUE && t !== Value.FALSE)) {
      throw new Error(`runtime error: expected (<Bool>, <Bool>) but got ${arg}`);
    }
    return (arg.car === Value.TRUE && arg.cdr === Value.TRUE) ? Value.TRUE : Value.FALSE;
  });
  static NOT = new Primitive(wrd.NOT, (arg: Term) => {
    if (!(arg instanceof Value) || [Value.TRUE, Value.FALSE].every(v => v !== arg)) {
      throw new Error(`runtime error: expected <Bool> but got ${arg}`);
    }
    return arg === Value.TRUE ? Value.FALSE : Value.TRUE;
  });

  str: string;
  func: (arg: Term) => Term;

  constructor(str: string, func: (arg: Term) => Term) {
    super();
    this.str = str;
    this.func = func;
  }
 
  addEnv(...env: EvalEnv[]) {
    return;
  }
  
  evaluate() {
    console.log('evaluate<Primitive>:', this.toString());
    return <Primitive>this;
  }

  toString() {
    return this.str;
  }
}

export class Value extends Term {
  static TRUE = new Value(true);
  static FALSE = new Value(false);

  value: boolean | number;

  constructor(value: boolean | number) {
    super();
    this.value = value;
  }

  addEnv(...env: EvalEnv[]) {
    return;
  }

  evaluate() {
    console.log('evaluate<Value>:', this.toString());
    return <Value>this;
  }

  toString() {
    return this.value.toString();
  }
}

export class Lambda extends Term {
  arg: Variable;
  body: Term;

  constructor(arg: Variable, body: Term) {
    super();
    this.arg = arg;
    this.body = body;
  }

  addEnv(...env: EvalEnv[]) {
    super.addEnv(...env);
    this.body.addEnv(...env);
  }

  evaluate() {
    console.log('evaluate<Lambda>:', this.toString());
    return <Lambda>this;
  }

  toString() {
    return `(λ${this.arg}.${this.body})`;
  }
}

export class Pair extends Term {
  car: Term;
  cdr: Term;

  constructor(car: Term, cdr: Term) {
    super();
    this.car = car;
    this.cdr = cdr;
  }

  addEnv(...env: EvalEnv[]) {
    super.addEnv(...env);
    this.car.addEnv(...env);
    this.cdr.addEnv(...env);
  }

  evaluate() {
    console.log('evaluate<Pair>:', this.toString());
    const car = this.car.evaluate();
    const cdr = this.cdr.evaluate();

    const result = concrete([ car, cdr ], ([ car, cdr ]) => new Pair(car, cdr));
    return result;
  }

  toString() {
    return `(${this.car}, ${this.cdr})`;
  }
}

export class PairCar extends Term {
  pair: Term;

  constructor(pair: Term) {
    super();
    this.pair = pair;
  }

  addEnv(...env: EvalEnv[]) {
    super.addEnv(...env);
    this.pair.addEnv(...env);
  }

  evaluate() {
    console.log('evaluate<PairCar>:', this.toString());
    const pair = this.pair.evaluate();
    return concrete([ pair ], ([ pair ]) => {
      if (!(pair instanceof Pair)) {
        throw new Error(`runtime error: expected <Pair> but got ${pair}`);
      } else {
        return pair.car;
      }
    });
  }

  toString() {
    return `${this.pair}.1`;
  }
}

export class PairCdr extends Term {
  pair: Term;

  constructor(pair: Term) {
    super();
    this.pair = pair;
  }

  addEnv(...env: EvalEnv[]) {
    super.addEnv(...env);
    this.pair.addEnv(...env);
  }

  evaluate() {
    console.log('evaluate<PairCar>:', this.toString());
    const pair = this.pair.evaluate();
    return concrete([ pair ], ([ pair ]) => {
      if (!(pair instanceof Pair)) {
        throw new Error(`runtime error: expected <Pair> but got ${pair}`);
      }
      return pair.cdr;
    })
  }

  toString() {
    return `${this.pair}.2`;
  }
}

export class Application extends Term {
  abs: Term;
  arg: Term;

  constructor(abs: Term, arg: Term) {
    super();
    this.abs = abs;
    this.arg = arg;
  }

  addEnv(...env: EvalEnv[]) {
    super.addEnv(...env);
    this.abs.addEnv(...env);
    this.arg.addEnv(...env);
  }

  evaluate() {
    const before = this.toString()
    console.log('evaluate<Application>:', before);
    super.evaluate();
    const abs = this.abs.evaluate();
    const arg = this.arg.evaluate();
    console.log('applicating of', abs.toString(), 'with', arg.toString(), 'from', before);
   
    return concrete([ abs, arg ], ([ abs, arg ]) => {
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

export class Future extends Term {
  term: Term;

  constructor(term: Term) {
    super();
    this.term = term;
  }

  addEnv(...env: EvalEnv[]) {
    super.addEnv(...env);
    this.term.addEnv(...env);
  }

  evaluate() {
    console.log('evaluate<Future>:', this.toString());
    
    // production
    // return new Promise<Term>(resolve => resolve(this.term.evaluate()));

    // development
    return new Promise<Term>((resolve) => {
      if (!FUTURE_DELAY_MAX) {
        resolve(this.term.evaluate());
      } else {
        const delay = Math.floor(Math.random() * FUTURE_DELAY_MAX);
        setTimeout(() => resolve(this.term.evaluate()), delay);
      }
    });
  }

  toString() {
    return `(future ${this.term})`;
  }
}