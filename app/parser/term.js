class Variable {
  constructor(label) {
    this.label = label;
  }
}

class Instance {
  constructor(str) {
    this.str = str;
  }
}

class Let {
  constructor(arg, bound, body) {
    this.arg = arg;
    this.bound = bound;
    this.body = body;
  }
}

class Fun {
  constructor(arg, type, body, async = false) {
    this.arg = arg;
    this.type = type;
    this.body = body;
    this.async = async;
  }
}

class AsyncFun extends Fun {
  constructor(arg, type, body) {
    super(arg, type, body, true);
  }
}

class Pair {
  constructor(car, cdr) {
    this.car = car;
    this.cdr = cdr;
  }
}

class PairCar {
  constructor(pair) {
    this.pair = pair;
  }
}

class PairCdr {
  constructor(pair) {
    this.pair = pair;
  }
}

class Application {
  constructor(t1, t2) {
    this.fun = t1;
    this.arg = t2;
  }
}

module.exports = {
  Variable,
  Instance,
  Let,
  Fun,
  AsyncFun,
  Pair,
  PairCar,
  PairCdr,
  Application,
};