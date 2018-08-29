import { inspect } from 'util';
import * as wrd from './word';
import { fork } from 'child_process';
import * as path from 'path';

const FUTURE_DELAY_MAX = 2000;

export type FutureMessage = {
  term: Term,
  error?: string,
}

const concrete = (values: (Term | Promise<Term>)[], then: (results: Term[]) => Term | Promise<Term>) => {
  if (values.some(value => value instanceof Promise)) {
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
    return `\n\t{${this.label} -> ${this.term}}`;
    // return `\n\t{${this.label} -> ${this.term} : ${this.term.env.map(e => e.label).join(',')}}`;
  }
}

export class Term {
  name: string = Term.name;
  // env: EvalEnv[] = [];

  evaluate(): Term | Promise<Term> {
    return <Term>this;
  }

  addEnv(...env: EvalEnv[]) {
  }

  toString() {
    return '<None>';
  }

  static fromObject(term: any) {
    let t: Term;
    switch (term.name) {
      case Term.name: throw new Error('fuzzy term');
      case Variable.name: t = Variable.fromObject(term); break;
      case Primitive.name: t = Primitive.fromObject(term); break;
      case Value.name: t = Value.fromObject(term); break;
      case Lambda.name: t = Lambda.fromObject(term); break;
      case Pair.name: t = Pair.fromObject(term); break;
      case PairCar.name: t = PairCar.fromObject(term); break;
      case PairCdr.name: t = PairCdr.fromObject(term); break;
      case Application.name: t = Application.fromObject(term); break;
      case Future.name: t = Future.fromObject(term); break;
    }
    // t.env.forEach(env => env.term = Term.fromObject(env.term));
    return t;
  }
}

export class Variable extends Term {
  name: string = Variable.name;
  label: string;
  // env: EvalEnv[] = [];
  term: Term;

  constructor(label: string) {
    super();
    this.label = label;
  }

  // addEnv(...env: EvalEnv[]) {
  //   this.env.unshift(...env);
  // }
  addEnv(...envs: EvalEnv[]) {
    const env = envs.find(env => env.label === this.label);
    this.term = env ? env.term : this.term;
  }

  // evaluate() {
  //   const env = this.env.find(env => env.label === this.label);
  //   if (!env) {
  //     throw new Error(`runtime error: given no bindings for "${this.label}" in environment ${this.env}`);
  //   }
  //   console.log('evaluate<Variable>:', this.toString(), '=>', env.term.toString());
  //   return env.term;
  // }
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

  static fromObject(term: any) {
    return new Variable(term.label);
  }
}

export class Primitive extends Term {
  name: string = Primitive.name;
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

  static fromObject(term: any) {
    return new Primitive(term.str, term.func);
  }
}

export class Value extends Term {
  name: string = Value.name;
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

  static fromObject(term: any) {
    return new Value(term.value);
  }
}

export class Lambda extends Term {
  name: string = Lambda.name;
  arg: Variable;
  body: Term;

  constructor(arg: Variable, body: Term) {
    super();
    this.arg = arg;
    this.body = body;
  }

  addEnv(...env: EvalEnv[]) {
    // super.addEnv(...env);
    this.body.addEnv(...env);
  }

  evaluate() {
    console.log('evaluate<Lambda>:', this.toString());
    return <Lambda>this;
  }

  toString() {
    return `(λ${this.arg}.${this.body})`;
  }

  static fromObject(term: any) {
    return new Lambda(Variable.fromObject(term.arg), Term.fromObject(term.body));
  }
}

export class Pair extends Term {
  name: string = Pair.name;
  car: Term;
  cdr: Term;

  constructor(car: Term, cdr: Term) {
    super();
    this.car = car;
    this.cdr = cdr;
  }

  addEnv(...env: EvalEnv[]) {
    // super.addEnv(...env);
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

  static fromObject(term: any) {
    return new Pair(Term.fromObject(term.car), Term.fromObject(term.cdr));
  }
}

export class PairCar extends Term {
  name: string = PairCar.name;
  pair: Term;

  constructor(pair: Term) {
    super();
    this.pair = pair;
  }

  addEnv(...env: EvalEnv[]) {
    // super.addEnv(...env);
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

  static fromObject(term: any) {
    return new PairCar(Term.fromObject(term.pair));
  }
}

export class PairCdr extends Term {
  name: string = PairCdr.name;
  pair: Term;

  constructor(pair: Term) {
    super();
    this.pair = pair;
  }

  addEnv(...env: EvalEnv[]) {
    // super.addEnv(...env);
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

  static fromObject(term: any) {
    return new PairCdr(Term.fromObject(term.pair));
  }
}

export class Application extends Term {
  name: string = Application.name;
  abs: Term;
  arg: Term;

  constructor(abs: Term, arg: Term) {
    super();
    this.abs = abs;
    this.arg = arg;
  }

  addEnv(...env: EvalEnv[]) {
    // super.addEnv(...env);
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
        // console.log('application env:', abs.body.env.toString());

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

  static fromObject(term: any) {
    return new Application(Term.fromObject(term.abs), Term.fromObject(term.arg));
  }
}

export class Future extends Term {
  name: string = Future.name;
  term: Term;

  constructor(term: Term) {
    super();
    this.term = term;
  }

  addEnv(...env: EvalEnv[]) {
    // super.addEnv(...env);
    this.term.addEnv(...env);
  }

  evaluate() {
    console.log('evaluate<Future>:', this.toString());
    console.log(inspect(this.term, { depth: Infinity, colors: true }));
    

    const child = fork(path.join(__dirname, './child'));

    child.on('error', (e) => {
      console.error('<!> error in child process:', e);
      throw e;
    });

    return new Promise<Term>((resolve, reject) => {
      child.on('message', ({ term: evaluated, error }: FutureMessage) => {
        if (error) {
          reject(error);
        } else {
          resolve(Term.fromObject(evaluated));
        }
      });

      const message: FutureMessage = {
        term: this.term,
      };
      child.send(message);
    });

    // return new Promise<Term>(resolve => resolve(this.term.evaluate()));

    // return new Promise<Term>((resolve) => {
    //   if (!FUTURE_DELAY_MAX) {
    //     resolve(this.term.evaluate());
    //   } else {
    //     const delay = Math.floor(Math.random() * FUTURE_DELAY_MAX);
    //     setTimeout(() => resolve(this.term.evaluate()), delay);
    //   }
    // });
  }
  
  toString() {
    return `(future ${this.term})`;
  }

  static fromObject(term: any) {
    return new Future(Term.fromObject(term.term));
  }
}