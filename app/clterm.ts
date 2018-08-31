import { log, error, inspect } from './logger';
import * as wrd from './word';
import { fork } from 'child_process';
import * as path from 'path';

const FUTURE_DELAY_MAX = 2000;

class EvalEnv {
  label: string;
  term: Term;

  constructor(label: string, term: Term) {
    this.label = label;
    this.term = term;
  }

  toString() {
    return `\n\t{${this.label} -> ${this.term}}`;
  }
}

enum Kind {
  Term,
  Variable,
  Primitive,
  Value,
  Lambda,
  Pair,
  PairCar,
  PairCdr,
  Application,
  Future,
}

export type ProcessMessage = {
  term: Object,
  error?: string,
}

export const fromObject = (obj: any): Term => {
  switch ((<Term>obj).kind) {
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
}

const concrete = (values: (Term | Promise<Term>)[], then: (results: Term[]) => Term | Promise<Term>) => {
  if (values.some(value => value instanceof Promise)) {
    return Promise.all(values).then(then);
  } else {
    return then(<Term[]>values);
  }
}

export class Term {
  kind: Kind = Kind.Term;

  evaluate(): Term | Promise<Term> {
    return <Term>this;
  }

  addEnv(...env: EvalEnv[]) {
  }

  toString() {
    return '<None>';
  }
}

export class Variable extends Term {
  kind: Kind = Kind.Variable;
  label: string;
  term: Term;

  constructor(label: string, term?: Term) {
    super();
    this.label = label;
    this.term = term;
  }

  addEnv(...envs: EvalEnv[]) {
    const env = envs.find(env => env.label === this.label);
    this.term = env ? env.term : this.term;
  }

  evaluate() {
    if (!this.term) {
      throw new Error(`runtime error: given no bindings for "${this.label}"`);
    }
    log('evaluate<Variable>:', this.toString(), '=>', this.term.toString());
    return this.term;
  }

  toString() {
    return this.label;
  }

  static fromObject(term: any) {
    return new Variable(term.label, term.term && fromObject(term.term));
  }
}

export class Primitive extends Term {
  kind: Kind = Kind.Primitive;
  static AND = new Primitive(wrd.AND, (arg: Term) => {
    if (!(arg instanceof Pair && arg.car instanceof Value && arg.cdr instanceof Value)) {
      throw new Error(`runtime error: expected (<Value>, <Value>) but got ${arg}`);
    }
    return (arg.car.value && arg.cdr.value) ? new Value(true) : new Value(false);
  });
  static NOT = new Primitive(wrd.NOT, (arg: Term) => {
    if (!(arg instanceof Value)) {
      throw new Error(`runtime error: expected <Value> but got ${arg}`);
    }
    return arg.value === true ? new Value(false) : new Value(true);
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
    log('evaluate<Primitive>:', this.toString());
    return <Primitive>this;
  }

  toString() {
    return this.str;
  }

  static fromObject(term: any) {
    switch (term.str) {
      case wrd.AND: return Primitive.AND;
      case wrd.NOT: return Primitive.NOT;
    }
  }
}

export class Value extends Term {
  kind: Kind = Kind.Value;
  value: boolean | number;

  constructor(value: boolean | number) {
    super();
    this.value = value;
  }

  addEnv(...env: EvalEnv[]) {
    return;
  }

  evaluate() {
    log('evaluate<Value>:', this.toString());
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
  kind: Kind = Kind.Lambda;
  arg: Variable;
  body: Term;

  constructor(arg: Variable, body: Term) {
    super();
    this.arg = arg;
    this.body = body;
  }

  addEnv(...env: EvalEnv[]) {
    this.body.addEnv(...env);
  }

  evaluate() {
    log('evaluate<Lambda>:', this.toString());
    return <Lambda>this;
  }

  toString() {
    return `(λ${this.arg}.${this.body})`;
  }

  static fromObject(term: any) {
    return new Lambda(Variable.fromObject(term.arg), fromObject(term.body));
  }
}

export class Pair extends Term {
  kind: Kind = Kind.Pair;
  car: Term;
  cdr: Term;

  constructor(car: Term, cdr: Term) {
    super();
    this.car = car;
    this.cdr = cdr;
  }

  addEnv(...env: EvalEnv[]) {
    this.car.addEnv(...env);
    this.cdr.addEnv(...env);
  }

  evaluate() {
    log('evaluate<Pair>:', this.toString());
    const car = this.car.evaluate();
    const cdr = this.cdr.evaluate();

    const result = concrete([ car, cdr ], ([ car, cdr ]) => new Pair(car, cdr));
    return result;
  }

  toString() {
    return `(${this.car}, ${this.cdr})`;
  }

  static fromObject(term: any) {
    return new Pair(fromObject(term.car), fromObject(term.cdr));
  }
}

export class PairCar extends Term {
  kind: Kind = Kind.PairCar;
  pair: Term;

  constructor(pair: Term) {
    super();
    this.pair = pair;
  }

  addEnv(...env: EvalEnv[]) {
    this.pair.addEnv(...env);
  }

  evaluate() {
    log('evaluate<PairCar>:', this.toString());
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
    return new PairCar(fromObject(term.pair));
  }
}

export class PairCdr extends Term {
  kind: Kind = Kind.PairCdr;
  pair: Term;

  constructor(pair: Term) {
    super();
    this.pair = pair;
  }

  addEnv(...env: EvalEnv[]) {
    this.pair.addEnv(...env);
  }

  evaluate() {
    log('evaluate<PairCar>:', this.toString());
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
    return new PairCdr(fromObject(term.pair));
  }
}

export class Application extends Term {
  kind: Kind = Kind.Application;
  abs: Term;
  arg: Term;

  constructor(abs: Term, arg: Term) {
    super();
    this.abs = abs;
    this.arg = arg;
  }

  addEnv(...env: EvalEnv[]) {
    this.abs.addEnv(...env);
    this.arg.addEnv(...env);
  }

  evaluate() {
    const before = this.toString()
    log('evaluate<Application>:', before);
    const abs = this.abs.evaluate();
    const arg = this.arg.evaluate();
    log('applicating of', abs.toString(), 'with', arg.toString(), 'from', before);
   
    return concrete([ abs, arg ], ([ abs, arg ]) => {
      let result: Term | Promise<Term>;
      if (abs instanceof Lambda) {
        const newEnv = new EvalEnv(abs.arg.label, arg);
        abs.body.addEnv(newEnv);
        result = abs.body.evaluate();
      }
      if (abs instanceof Primitive) {        
        result = abs.func(arg);
      }
      log('result<Application> of', before, ': \n\t', result.toString());
      return result;
    });
  }

  toString() {
    return `(${this.abs} ${this.arg})`;
  }

  static fromObject(term: any) {
    return new Application(fromObject(term.abs), fromObject(term.arg));
  }
}

export class Future extends Term {
  kind: Kind = Kind.Future;
  term: Term;

  constructor(term: Term) {
    super();
    this.term = term;
  }

  addEnv(...env: EvalEnv[]) {
    this.term.addEnv(...env);
  }

  evaluate() {
    log('evaluate<Future>:', this.toString());;

    const child = fork(path.join(__dirname, './child'));

    child.on('error', (e) => {
      error('<!> error in child process:', e);
      throw e;
    });

    return new Promise<Term>((resolve, reject) => {
      child.on('message', ({ term: evaluated, error }: ProcessMessage) => {
        if (error) {
          reject(error);
        } else {
          resolve(fromObject(evaluated));
        }
      });

      const message: ProcessMessage = {
        term: this.term,
      };
      child.send(message);
    });
  }
  
  toString() {
    return `(future ${this.term})`;
  }

  static fromObject(term: any) {
    return new Future(fromObject(term.term));
  }
}