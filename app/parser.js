const { inspect } = require('util');
const Iterator = require('./util/iterator');
const token = require('./token');
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

const deep = obj => inspect(obj, { depth: Infinity, colors: true });
const log = (str, obj) => {
  // console.log(str, deep(obj));
}
const isInstance = (instance, ...classes) => classes.some(clazz => instance instanceof clazz);

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

  getSingleTerm() {
    log('getSingleTerm, peek:', this.it.peek());
    
    let term = null;
    if (this.it.peek() === token.Construct.BRACKET_L) {
      this.it.next(); // (
      const t1 = this.getTerm(); // t1
      
      if (this.it.peek() === token.Construct.COMMA) {
        this.it.next(); // ,
        const t2 = this.getTerm(); // t2
        assert(this.it.peek(), token.Construct.BRACKET_R);
        this.it.next(); // )
        term = new Pair(t1, t2);
      } else if (this.it.peek() === token.Construct.BRACKET_R) {
        this.it.next(); // )
        term = t1;
      } else {
        throwSyntaxError(this.it.peek(), [token.Construct.COMMA, token.Construct.BRACKET_R]);
      }
    } else if (this.it.peek() instanceof token.Keyword) {
      if (this.it.peek() === token.Keyword.ASYNC) term = this.termAsyncFun();
      else if (this.it.peek() === token.Keyword.FUN) term = this.termFun();
      else if (this.it.peek() === token.Keyword.LET) term = this.termLet();
      else throwSyntaxError(this.it.peek(), [token.Keyword.ASYNC, token.Keyword.FUN, token.Keyword.LET]);
    } else if (this.it.peek() instanceof token.Identifier) {
      const identifier = this.it.next();
      term = new Variable(identifier);
    } else if (this.it.peek() instanceof token.Primitive) {
      const primitive = this.it.next();
      term = new Primitive(primitive);
    } else if (this.it.peek() instanceof token.Literal) {
      const literal = this.it.next();
      term = new Literal(literal);
    } else {
      throwSyntaxError(this.it.peek(), [token.Keyword, token.Identifier, token.Literal, token.Construct.BRACKET_L]);
    }
    if (this.it.peek() === token.Construct.PAIR_CAR) {
      this.it.next(); // .1
      term = new PairCar(term);
    } else if (this.it.peek() === token.Construct.PAIR_CDR) {
      this.it.next(); // .2
      term = new PairCdr(term);
    }
    return term;
  }

  hasNextArgTerm() {
    const peek = this.it.peek();
    if (isInstance(peek, token.Identifier, token.Primitive, token.Literal)) return true;
    if ([token.Construct.BRACKET_L, token.Keyword.ASYNC, token.Keyword.FUN, token.Keyword.LET].includes(peek)) return true;
    return false;
  }

  getTerm() {
    log('getTerm, peek:', this.it.peek());
    
    let term = this.getSingleTerm();
    while(this.hasNextArgTerm()) {
      const t2 = this.getSingleTerm();
      term = new Application(term, t2);
    }
    log('term:', term);
    return term;
  }

  getType() {
    log('getType, peek:', this.it.peek());

    let type = null;
    if (this.it.peek() === token.Construct.BRACKET_L) {
      this.it.next(); // (
      type = this.getType();
      assert(this.it.peek(), token.Construct.BRACKET_R);
      this.it.next(); // )
    } else if (this.it.peek() instanceof token.Primitive) {
      const identifier = this.it.next(); // T
      type = new Type(identifier);
    }
    if (this.it.peek() === token.Construct.ARROW) {
      this.it.next(); // ->
      const toType = this.getType();
      type = new FunType(type, toType);
    } else if (this.it.peek() === token.Construct.AARROW) {
      this.it.next(); // ->a
      const toType = this.getType();
      type = new AsyncFunType(type, toType);
    }
    log('type: ', type);
    return type;
  }

  termLet() {
    log('termLet, peek:', this.it.peek());

    this.it.next(); // let
    assertInstance(this.it.peek(), token.Identifier);
    const id = new Variable(this.it.next()); // x
    assert(this.it.peek(), token.Construct.EQUAL);
    this.it.next(); // =
    const t1 = this.getTerm(); // t1
    assert(this.it.peek(), token.Keyword.IN);
    this.it.next(); // in
    const t2 = this.getTerm(); // t2
    return new Let(id, t1, t2);
  }

  termAsyncFun() {
    log('termAsyncFun, peek:', this.it.peek());

    this.it.next(); // async
    assert(this.it.peek(), token.Keyword.FUN);
    this.it.next(); // fun
    assertInstance(this.it.peek(), token.Identifier);
    const arg = new Variable(this.it.next()); // x
    assert(this.it.peek(), token.Construct.COLON);
    this.it.next(); // :
    const type = this.getType(); // T
    // assertion?
    assert(this.it.peek(), token.Construct.EQUAL);
    this.it.next(); // =
    const body = this.getTerm(); // t
    return new AsyncFun(arg, type, body);
  }

  termFun() {
    log('termFun, peek:', this.it.peek());

    this.it.next(); // fun
    assertInstance(this.it.peek(), token.Identifier);
    const arg = new Variable(this.it.next()); // x
    assert(this.it.peek(), token.Construct.COLON);
    this.it.next(); // :
    const type = this.getType(); // T
    // assertion?
    assert(this.it.peek(), token.Construct.EQUAL);
    this.it.next(); // =
    const body = this.getTerm(); // t
    return new Fun(arg, type, body);
  }

}

module.exports = Parser;