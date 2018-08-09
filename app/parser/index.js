const Iterator = require('../util/iterator');
const { Keyword, Identifier, Construct, Literal } = require('../lexer/token');
const { Let } = require('./term');

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.it = new Iterator(tokens);
  }

  parse() {
    return this.getTerm();
  }

  getTerm() {
    const token = this.it.peek();
    if (token instanceof Keyword) {
      if (token.value === Keyword.LET) return this.termLet();
      if (token.value === Keyword.ASYNC) return this.termAsyncFun();
      if (token.value === Keyword.FUNC) return this.termFun();
    }
  }

  termLet() {
    this.it.next(); // let
    const id = this.it.next(); // x
    if (!(id instanceof Identifier)) {
      throw new Error('syntax error: expected identifier but got ' + id.value);
    }
    const equal = this.it.next(); // =
    if (!(equal instanceof Construct && equal.value === Construct.EQUAL)) {
      throw new Error('syntax error: expected "=" but got ' + equal.value);
    }
    const t1 = this.getTerm(); // t1
    const inkey = this.it.next(); // in
    if (!(inkey instanceof Keyword && inkey.value === Keyword.IN)) {
      throw new Error('syntax error: expected "in" but got ' + inkey.value);
    }
    const t2 = this.getTerm(); // t2
    return new Let(arg, t1, t2);
  }

  termAsyncFun() {
    this.it.next(); // async
    const fun = this.it.next(); // fun
    if (!(fun instanceof Keyword && fun.value == Keyword.FUN)) {
      throw new Error('syntax error: expected "fun" but got ' + fun.value);
    }
    const arg = this.it.next(); // x
    if (!(arg instanceof Identifier)) {
      throw new Error('syntax error: expected identifier but got ' + arg.value);
    }
    const colon = this.it.next(); // :
    if (!(colon instanceof Construct && colon.value == Construct.COLON)) {
      throw new Error('syntax error: expected ":" but got ' + colon.value);
    }
    const type = this.getTerm();
    // if (!(type instanceof Type))
  }

}

module.exports = {
  Parser,
};