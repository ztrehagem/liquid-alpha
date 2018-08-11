const Iterator = require('../util/iterator');
const { Keyword, Identifier, Construct, Literal } = require('../lexer/token');
const { Variable, Instance, Let, Fun, AsyncFun, Pair, PairCar, PairCdr, Application } = require('./term');

const throwSyntaxError = (actual, expect) => {
  const expectStr = Array.isArray(expect) ? expect.join('", "') : expect.toString();
  throw new Error(`syntax error: expected "${expectStr}" but got "${actual}"`)
};

const assert = (actual, expect) => {
  if (actual !== expect) throwSyntaxError(actual, expect);
};

const assertInstance = (object, clazz) => {
  if (!(object instanceof clazz)) throwSyntaxError(object, clazz.name);
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.it = new Iterator(tokens);
  }

  parse() {
    return this.getTerm();
  }

  getTerm_() {
    let term = null;
    const token = this.it.peek();
    // literal
    // identifier
    if (token instanceof Construct) {
      if (token.value === Construct.BRACKET_L) {
        // (t, t)
        // (t)
        this.it.next(); // (
        const t1 = this.getTerm();
        // const c = 
      }
    } else if (token instanceof Keyword) {
      if (token.value === Keyword.LET) term = this.termLet();
      else if (token.value === Keyword.ASYNC) term = this.termAsyncFun();
      else if (token.value === Keyword.FUNC) term = this.termFun();
    }

    // 次のtokenを見る // 再帰的にやる // (t1 t2) t3
    // t1 t2 // 次spaceだったら関数適用 t2 = getTerm()で親termが関数適用
    // .1? .2? // .1と.2が親term
    // 左結合
    const next = this.it.peek();
    if (next instanceof Construct) {
      if (next.value === Construct.PAIR_CAR) {
        // .1
        // term = new PairCar(term);
        // continue
      } else if (next.value === Construct.PAIR_CDR) {
        // .2
        // term = new PairCdr(term);
        // continue
      }
      // return term;
    }
    // t t // 配列で返す？
    // if (next instanceof Identifier || next instanceof Keyword) { // id, async, fun, let
    //   // t t
    //   // const t2 = this.getTerm();
    //   // term = new Application(term, t2);
    //   // continue
    // }
  }

  getType_(level = 0) {
    const token = this.it.next();
    if (token instanceof Construct && token.value === Construct.BRACKET_L) return this.getType(level + 1);
    if (token instanceof Identifier)
    if (token instanceof Construct && token.value === Construct.BRACKET_R) return 

  }

  getSingleTerm() {
    // console.log('getSingleTerm, peek:', this.it.peek());
    
    let term = null;
    if (this.it.peek() === Construct.BRACKET_L) {
      this.it.next(); // (
      const t1 = this.getTerm(); // t1
      if (this.it.peek() === Construct.COMMA) {
        this.it.next(); // ,
        const t2 = this.getTerm(); // t2
        assert(this.it.peek(), Construct.BRACKET_R);
        this.it.next(); // )
        term = new Pair(t1, t2);
      } else if (this.it.peek() === Construct.BRACKET_R) {
        term = t1;
      } else {
        throwSyntaxError(this.it.peek(), [Construct.COMMA, Construct.BRACKET_R]);
      }
    } else if (this.it.peek() instanceof Keyword) {
      if (this.it.peek() === Keyword.ASYNC) term = this.termAsyncFun();
      else if (this.it.peek() === Keyword.FUN) term = this.termFun();
      else if (this.it.peek() === Keyword.LET) term = this.termLet();
      else throwSyntaxError(this.it.peek(), [Keyword.ASYNC, Keyword.FUN, Keyword.LET]);
    } else if (this.it.peek() instanceof Identifier) {
      const identifier = this.it.next();
      term = new Variable(identifier.toString());
    } else if (this.it.peek() instanceof Literal) {
      const literal = this.it.next();
      term = new Instance(literal.toString());
    } else {
      throwSyntaxError(this.it.peek(), [Keyword, Identifier, Construct.BRACKET_L]);
    }
    if (this.it.peek() === Construct.PAIR_CAR) {
      this.it.next(); // .1
      term = new PairCar(term);
    } else if (this.it.peek() === Construct.PAIR_CDR) {
      this.it.next(); // .2
      term = new PairCdr(term);
    }
    return term;
  }

  getTerm() {
    // console.log('getTerm, peek:', this.it.peek());
    
    let term = this.getSingleTerm();
    while (this.it.peek() instanceof Identifier || [Construct.BRACKET_L, Keyword.ASYNC, Keyword.FUN, Keyword.LET].includes(this.it.peek())) {
      const t2 = this.getSingleTerm();
      term = new Application(term, t2);
    }
    // console.log('term');
    // console.log(term);
    return term;
  }

  getType() {
    // console.log('getType, peek:', this.it.peek());
    
    this.it.next();
  }

  termLet() {
    // console.log('termLet, peek:', this.it.peek());

    this.it.next(); // let
    assertInstance(this.it.peek(), Identifier);
    const id = new Variable(this.it.next().toString()); // x
    assert(this.it.peek(), Construct.EQUAL);
    this.it.next(); // =
    const t1 = this.getTerm(); // t1
    assert(this.it.peek(), Keyword.IN);
    this.it.next(); // in
    const t2 = this.getTerm(); // t2
    return new Let(id, t1, t2);
  }

  termAsyncFun() {
    // console.log('termAsyncFun, peek:', this.it.peek());

    this.it.next(); // async
    assert(this.it.peek(), Keyword.FUN);
    this.it.next(); // fun
    assertInstance(this.it.peek(), Identifier);
    const arg = new Variable(this.it.next().toString()); // x
    assert(this.it.peek(), Construct.COLON);
    this.it.next(); // :
    const type = this.getType(); // T
    // assertion?
    assert(this.it.peek(), Construct.EQUAL);
    this.it.next(); // =
    const body = this.getTerm(); // t
    return new AsyncFun(arg, type, body);
  }

  termFun() {
    // console.log('termFun, peek:', this.it.peek());

    this.it.next(); // fun
    assertInstance(this.it.peek(), Identifier);
    const arg = new Variable(this.it.next().toString()); // x
    assert(this.it.peek(), Construct.COLON);
    this.it.next(); // :
    const type = this.getType(); // T
    // assertion?
    assert(this.it.peek(), Construct.EQUAL);
    this.it.next(); // =
    const body = this.getTerm(); // t
    return new Fun(arg, type, body);
  }

}

module.exports = {
  Parser,
};