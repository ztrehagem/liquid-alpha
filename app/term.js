const tkn = require('./token');
const typ = require('./type');

class Term {
  constructor(type = null) {
    this.type = type;
  }

  checkType(env = []) {
    return this.type;
  }
}

class Variable extends Term {
  constructor(label) {
    super();
    this.label = label.toString();
  }

  checkType(env = []) {
    const [, type] = env.find(([label, env]) => label === this.label);
    return this.type = type;
  }
}

class Primitive extends Term {
  constructor(str, type) {
    super(type);
    this.str = str.toString();
  }

  checkType(env = []) {
    return this.type;
  }

  static fromToken(token) {
    switch (token) {
      case tkn.Primitive.AND: return Primitive.AND;
      case tkn.Primitive.NOT: return Primitive.NOT;
      default: return null;
    }
  }
}
Primitive.AND = new Primitive(tkn.Primitive.AND, tkn.Primitive.AND.type);
Primitive.NOT = new Primitive(tkn.Primitive.NOT, tkn.Primitive.NOT.type);

class Literal extends Term {
  constructor(str, type) {
    super(type);
    this.str = str.toString();
  }

  checkType(env = []) {
    return this.type;
  }

  static fromToken(token) {
    switch (token) {
      case tkn.Literal.TRUE: return Literal.TRUE;
      case tkn.Literal.FALSE: return Literal.FALSE;
      default: return new Literal(token, token.type);
    }
  }
}
Literal.TRUE = new Literal(tkn.Literal.TRUE, tkn.Literal.TRUE.type);
Literal.FALSE = new Literal(tkn.Literal.FALSE, tkn.Literal.FALSE.type);

class Let extends Term {
  constructor(arg, bound, body) {
    super();
    this.arg = arg;
    this.bound = bound;
    this.body = body;
  }

  checkType(env = []) {
    const boundType = this.bound.checkType(env);
    const newEnv = [this.arg.label, boundType];
    return this.type = this.body.checkType([newEnv, ...env]);
  }
}

class Fun extends Term {
  constructor(arg, argType, body) {
    super();
    this.arg = arg;
    this.argType = argType;
    this.body = body;
  }

  checkType(env = []) {
    const newEnv = [this.arg.label, this.argType];
    const bodyType = this.body.checkType([newEnv, ...env]);
    return this.type = new typ.FunType(this.argType, bodyType);
  }
}

class AsyncFun extends Fun {
  constructor(arg, argType, body) {
    super(arg, argType, body);
  }

  checkType(env = []) {
    const newEnv = [this.arg.label, this.argType];
    const bodyType = this.body.checkType([newEnv, ...env]);
    return this.type = new typ.AsyncFunType(this.argType, bodyType);
  }
}

class Pair extends Term {
  constructor(car, cdr) {
    super();
    this.car = car;
    this.cdr = cdr;
  }

  checkType(env = []) {
    const carType = this.car.checkType(env);
    const cdrType = this.cdr.checkType(env);
    return this.type = new typ.PairType(carType, cdrType);
  }  
}

class PairCar extends Term {
  constructor(pair) {
    super();
    this.pair = pair;
  }

  checkType(env = []) {
    return this.type = this.pair.checkType(env).car;
  }
}

class PairCdr extends Term {
  constructor(pair) {
    super();
    this.pair = pair;
  }

  checkType(env = []) {
    return this.type = this.pair.checkType(env).cdr;
  }
}

class Application extends Term {
  constructor(abs, arg) {
    super();
    this.abs = abs;
    this.arg = arg;
  }

  checkType(env = []) {
    const absType = this.abs.checkType(env);
    const argType = this.arg.checkType(env);
    if (!(absType instanceof typ.FunType))
      throw new Error(`type error: expected FunType but got "${absType}"`);
    
    if (!absType.def.equalTo(argType))
      throw new Error(`type error: expected "${absType.def}" but got "${argType}"`);
    return this.type = absType.dom;
  }
}

module.exports = {
  Term,
  Variable,
  Primitive,
  Literal,
  Let,
  Fun,
  AsyncFun,
  Pair,
  PairCar,
  PairCdr,
  Application,
};