import * as wrd from './word';

export class Term {

}

export class Variable extends Term {
  label: string;

  constructor(label: string) {
    super();
    this.label = label;
  }
}

export class Primitive extends Term {
  static AND = new Primitive();
  static NOT = new Primitive();
}

export class Literal extends Term {
  static TRUE = new Literal(true);
  static FALSE = new Literal(false);

  value: boolean | number;

  constructor(value: boolean | number) {
    super();
    this.value = value;
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
}

export class Pair extends Term {
  car: Term;
  cdr: Term;

  constructor(car: Term, cdr: Term) {
    super();
    this.car = car;
    this.cdr = cdr;
  }
}

export class PairCar extends Term {
  pair: Term;

  constructor(pair: Term) {
    super();
    this.pair = pair;
  }
}

export class PairCdr extends Term {
  pair: Term;

  constructor(pair: Term) {
    super();
    this.pair = pair;
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
}

export class Future extends Term {
  term: Term;

  constructor(term: Term) {
    super();
    this.term = term;
  }
}