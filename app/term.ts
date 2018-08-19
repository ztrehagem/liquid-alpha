import * as typ from './type';
import * as wrd from './word';
import TypeRule from './type-rule';

export class Term {
  type: typ.Type;

  constructor(type: typ.Type = null) {
    this.type = type;
  }

  checkType(env: TypeRule[] = []) {
    return this.type;
  }

  compile() {
    return this;
  }
}

export class Variable extends Term {
  label: string;

  constructor(label: string) {
    super();
    this.label = label.toString();
  }

  checkType(env: TypeRule[] = []) {
    const { type } = env.find(({ label, type }) => label === this.label);
    return this.type = type;
  }
}

export class Primitive extends Term {
  str: string;
  static AND: Primitive = new Primitive(wrd.AND, new typ.FunType(new typ.PairType(typ.BOOL, typ.BOOL), typ.BOOL));
  static NOT: Primitive = new Primitive(wrd.NOT, new typ.FunType(typ.BOOL, typ.BOOL));

  constructor(str: string, type: typ.Type) {
    super(type);
    this.str = str;
  }

  checkType(env: TypeRule[] = []) {
    return this.type;
  }
}

export class Literal extends Term {
  str: string;
  static TRUE: Literal = new Literal(wrd.TRUE, typ.BOOL);
  static FALSE: Literal = new Literal(wrd.FALSE, typ.BOOL);

  constructor(str: string, type: typ.Type) {
    super(type);
    this.str = str;
  }

  checkType(env: TypeRule[] = []) {
    return this.type;
  }
}

export class Let extends Term {
  arg: Variable;
  bound: Term;
  body: Term;

  constructor(arg: Variable, bound: Term, body: Term) {
    super();
    this.arg = arg;
    this.bound = bound;
    this.body = body;
  }

  checkType(env: TypeRule[] = []) {
    const boundType = this.bound.checkType(env);
    const newEnv = new TypeRule(this.arg.label, boundType);
    return this.type = this.body.checkType([newEnv, ...env]);
  }
}

export class Fun extends Term {
  arg: Variable;
  argType: typ.Type;
  body: Term;

  constructor(arg: Variable, argType: typ.Type, body: Term) {
    super();
    this.arg = arg;
    this.argType = argType;
    this.body = body;
  }

  checkType(env: TypeRule[] = []) {
    const newEnv = new TypeRule(this.arg.label, this.argType);
    const bodyType = this.body.checkType([newEnv, ...env]);
    return this.type = new typ.FunType(this.argType, bodyType);
  }
}

export class AsyncFun extends Fun {
  constructor(arg: Variable, argType: typ.Type, body: Term) {
    super(arg, argType, body);
  }

  checkType(env: TypeRule[] = []) {
    const newEnv = new TypeRule(this.arg.label, this.argType);
    const bodyType = this.body.checkType([newEnv, ...env]);
    return this.type = new typ.AsyncFunType(this.argType, bodyType);
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

  checkType(env: TypeRule[] = []) {
    const carType = this.car.checkType(env);
    const cdrType = this.cdr.checkType(env);
    return this.type = new typ.PairType(carType, cdrType);
  }
}

export class PairCar extends Term {
  pair: Term;

  constructor(pair: Term) {
    super();
    this.pair = pair;
  }

  checkType(env: TypeRule[] = []) {
    const pairType = this.pair.checkType(env);
    if (!(pairType instanceof typ.PairType))
      throw new Error(`type error: expected PairType but got "${pairType}"`);
    return this.type = pairType.car;
  }
}

export class PairCdr extends Term {
  pair: Term;

  constructor(pair: Term) {
    super();
    this.pair = pair;
  }

  checkType(env: TypeRule[] = []) {
    const pairType = this.pair.checkType(env);
    if (!(pairType instanceof typ.PairType))
      throw new Error(`type error: expected PairType but got "${pairType}"`);
    return this.type = pairType.cdr;
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

  checkType(env: TypeRule[] = []) {
    const absType = this.abs.checkType(env);
    const argType = this.arg.checkType(env);
    if (!(absType instanceof typ.FunType))
      throw new Error(`type error: expected FunType but got "${absType}"`);

    if (!absType.def.equalTo(argType))
      throw new Error(`type error: expected "${absType.def}" but got "${argType}"`);
    return this.type = absType.dom;
  }
}
