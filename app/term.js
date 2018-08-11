class Term {
  constructor() {
    this.type = null;
  }
}

class Variable extends Term {
  constructor(label) {
    super();
    this.label = label.toString();
  }
}

class Primitive extends Term {
  constructor(str) {
    super();
    this.str = str.toString();
  }
}

class Literal extends Term {
  constructor(str) {
    super();
    this.str = str.toString();
  }
}

class Let extends Term {
  constructor(arg, bound, body) {
    super();
    this.arg = arg;
    this.bound = bound;
    this.body = body;
  }
}

class Fun extends Term {
  constructor(arg, argType, body, async = false) {
    super();
    this.arg = arg;
    this.argType = argType;
    this.body = body;
    this.async = async;
  }
}

class AsyncFun extends Fun {
  constructor(arg, type, body) {
    super(arg, type, body, true);
  }
}

class Pair extends Term {
  constructor(car, cdr) {
    super();
    this.car = car;
    this.cdr = cdr;
  }
}

class PairCar extends Term {
  constructor(pair) {
    super();
    this.pair = pair;
  }
}

class PairCdr extends Term {
  constructor(pair) {
    super();
    this.pair = pair;
  }
}

class Application extends Term {
  constructor(t1, t2) {
    super();
    this.t1 = t1;
    this.t2 = t2;
  }
}

class Type extends Term {
  constructor(str, fun = false) {
    super();
    this.str = str.toString();
    this.fun = fun;
  }

  toString() {
    return this.str;
  }
}

class FunType extends Type {
  constructor(from, to, async = false) {
    super(`${from.fun ? `(${from})` : from} ${async ? '->a' : '->' } ${to}`, true);
    this.from = from;
    this.to = to;
    this.async = async;
  }
}

class AsyncFunType extends Type {
  constructor(from, to) {
    super(from, to, true);
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
  Type,
  FunType,
  AsyncFunType,
};