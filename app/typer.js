const term = require('./term');

const {
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
} = term;

class Typer {
  constructor(ast) {
    this.ast = ast;
  }

  check() {



    return this.ast;
  }
}

module.exports = Typer;