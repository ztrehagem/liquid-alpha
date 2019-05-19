import * as typ from './type';
import * as wrd from './word';
import * as clt from './clterm';
import TypeEnv from './type-env';

export class Term {
  type: typ.Type;

  constructor(type: typ.Type = null) {
    this.type = type;
  }

  checkType(env: TypeEnv[] = []) {
    return this.type;
  }

  compile() {
    return new clt.Term();
  }

  get size() {
    return 1;
  }
}

export class Variable extends Term {
  label: string;

  constructor(label: string) {
    super();
    this.label = label;
  }

  checkType(env: TypeEnv[] = []) {
    const { type } = env.find(({ label, type }) => label === this.label);
    return this.type = type;
  }

  compile() {
    return new clt.Variable(this.label);
  }

  get size() {
    return 1;
  }
}

export class Primitive extends Term {
  static AND = new Primitive(wrd.AND, new typ.FunType(new typ.PairType(typ.BOOL, typ.BOOL), typ.BOOL));
  static NOT = new Primitive(wrd.NOT, new typ.FunType(typ.BOOL, typ.BOOL));

  str: string;

  constructor(str: string, type: typ.Type) {
    super(type);
    this.str = str;
  }

  checkType(env: TypeEnv[] = []) {
    return this.type;
  }

  compile() {
    switch (this) {
      case Primitive.AND: return clt.Primitive.AND;
      case Primitive.NOT: return clt.Primitive.NOT;
      default: return null;
    }
  }

  get size() {
    return 1;
  }
}

export class Value extends Term {
  static TRUE = new Value(wrd.TRUE, typ.BOOL);
  static FALSE = new Value(wrd.FALSE, typ.BOOL);

  str: string;

  constructor(str: string, type: typ.Type) {
    super(type);
    this.str = str;
  }

  checkType(env: TypeEnv[] = []) {
    return this.type;
  }

  compile() {
    switch (this.type) {
      case typ.BOOL: return new clt.Value(this.str === wrd.TRUE);
      case typ.NUMBER: return new clt.Value(parseFloat(this.str));
      default: return null;
    }
  }
  
  get size() {
    return 1;
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

  checkType(env: TypeEnv[] = []) {
    const boundType = this.bound.checkType(env);
    const newEnv = new TypeEnv(this.arg.label, boundType);
    return this.type = this.body.checkType([newEnv, ...env]);
  }

  compile() {
    const abs = new clt.Lambda(this.arg.compile(), this.body.compile());
    return new clt.Application(abs, this.bound.compile());
  }

  get size() {
    return this.bound.size + this.body.size + 1;
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

  checkType(env: TypeEnv[] = []) {
    const newEnv = new TypeEnv(this.arg.label, this.argType);
    const bodyType = this.body.checkType([newEnv, ...env]);
    return this.type = new typ.FunType(this.argType, bodyType);
  }

  compile() {
    return new clt.Lambda(this.arg.compile(), this.body.compile());
  }
  
  get size() {
    return this.body.size + 1;
  }
}

export class AsyncFun extends Fun {
  constructor(arg: Variable, argType: typ.Type, body: Term) {
    super(arg, argType, body);
  }

  checkType(env: TypeEnv[] = []) {
    const newEnv = new TypeEnv(this.arg.label, this.argType);
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

  checkType(env: TypeEnv[] = []) {
    const carType = this.car.checkType(env);
    const cdrType = this.cdr.checkType(env);
    return this.type = new typ.PairType(carType, cdrType);
  }

  compile() {
    return new clt.Pair(this.car.compile(), this.cdr.compile());
  }

  get size() {
    return this.car.size + this.cdr.size + 1;
  }
}

export class PairCar extends Term {
  pair: Term;

  constructor(pair: Term) {
    super();
    this.pair = pair;
  }

  checkType(env: TypeEnv[] = []) {
    const pairType = this.pair.checkType(env);
    if (!(pairType instanceof typ.PairType))
      throw new Error(`type error: expected PairType but got "${pairType}"`);
    return this.type = pairType.car;
  }

  compile() {
    return new clt.PairCar(this.pair.compile());
  }

  get size() {
    return this.pair.size + 1;
  }
}

export class PairCdr extends Term {
  pair: Term;

  constructor(pair: Term) {
    super();
    this.pair = pair;
  }

  checkType(env: TypeEnv[] = []) {
    const pairType = this.pair.checkType(env);
    if (!(pairType instanceof typ.PairType))
      throw new Error(`type error: expected PairType but got "${pairType}"`);
    return this.type = pairType.cdr;
  }

  compile() {
    return new clt.PairCdr(this.pair.compile());
  }

  get size() {
    return this.pair.size + 1;
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

  checkType(env: TypeEnv[] = []) {
    const absType = this.abs.checkType(env);
    const argType = this.arg.checkType(env);
    if (!(absType instanceof typ.FunType))
      throw new Error(`type error: expected FunType but got "${absType}"`);

    if (!absType.def.equalTo(argType))
      throw new Error(`type error: expected "${absType.def}" but got "${argType}"`);
    return this.type = absType.dom;
  }

  compile() {
    const app = new clt.Application(this.abs.compile(), this.arg.compile());
    return (this.abs.type instanceof typ.AsyncFunType) ? new clt.Future(app) : app;
  }

  get size() {
    return this.abs.size + this.arg.size + 1;
  }
}
