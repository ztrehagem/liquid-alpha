const { inspect } = require('util');
const Iterator = require('./util/iterator');
const tkn = require('./token');
const trm = require('./term');
const typ = require('./type');

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
    const peek = this.it.peek();
    if (peek === tkn.Construct.BRACKET_L) {
      this.it.next(); // (
      const t1 = this.getTerm(); // t1
      const peek = this.it.peek();
      
      if (peek === tkn.Construct.COMMA) {
        this.it.next(); // ,
        const t2 = this.getTerm(); // t2
        assert(this.it.peek(), tkn.Construct.BRACKET_R);
        this.it.next(); // )
        term = new trm.Pair(t1, t2);
      } else if (peek === tkn.Construct.BRACKET_R) {
        this.it.next(); // )
        term = t1;
      } else {
        throwSyntaxError(peek, [tkn.Construct.COMMA, tkn.Construct.BRACKET_R]);
      }
    } else if (peek instanceof tkn.Keyword) {
      if (peek === tkn.Keyword.ASYNC) term = this.termAsyncFun();
      else if (peek === tkn.Keyword.FUN) term = this.termFun();
      else if (peek === tkn.Keyword.LET) term = this.termLet();
      else throwSyntaxError(peek, [tkn.Keyword.ASYNC, tkn.Keyword.FUN, tkn.Keyword.LET]);
    } else if (peek instanceof tkn.Identifier) {
      const identifier = this.it.next();
      term = new trm.Variable(identifier);
    } else if (peek instanceof tkn.PrimitiveFun) {
      const primitiveFun = this.it.next();
      term = primitiveFun.toTerm();
    } else if (peek instanceof tkn.Literal) {
      const literal = this.it.next();
      term = literal.toTerm();
    } else {
      throwSyntaxError(peek, [tkn.Keyword, tkn.Identifier, tkn.PrimitiveFun, tkn.Literal, tkn.Construct.BRACKET_L]);
    }
    if (this.it.peek() === tkn.Construct.PAIR_CAR) {
      this.it.next(); // .1
      term = new trm.PairCar(term);
    } else if (this.it.peek() === tkn.Construct.PAIR_CDR) {
      this.it.next(); // .2
      term = new trm.PairCdr(term);
    }
    return term;
  }

  hasNextArgTerm() {
    const peek = this.it.peek();
    if (isInstance(peek, tkn.Identifier, tkn.PrimitiveFun, tkn.Literal)) return true;
    if ([tkn.Construct.BRACKET_L, tkn.Keyword.ASYNC, tkn.Keyword.FUN, tkn.Keyword.LET].includes(peek)) return true;
    return false;
  }

  getTerm() {
    log('getTerm, peek:', this.it.peek());
    
    let term = this.getSingleTerm();
    while(this.hasNextArgTerm()) {
      const t2 = this.getSingleTerm();
      term = new trm.Application(term, t2);
    }
    log('term:', term);
    return term;
  }

  getType() {
    log('getType, peek:', this.it.peek());

    let type = null;
    if (this.it.peek() === tkn.Construct.BRACKET_L) {
      this.it.next(); // (
      type = this.getType(); // T

      if (this.it.peek() === tkn.Construct.COMMA) {
        this.it.next(); // ,
        const cdrType = this.getType(); // T
        assert(this.it.peek(), tkn.Construct.BRACKET_R);
        this.it.next(); // )
        type = new typ.PairType(type, cdrType);
      } else if (this.it.peek() === tkn.Construct.BRACKET_R) {
        this.it.next(); // )
      } else {
        throwSyntaxError(this.it.peek(), [tkn.Construct.COMMA, tkn.Construct,BRACKET_R]);
      }
    } else if (this.it.peek() instanceof tkn.PrimitiveType) {
      const primitive = this.it.next(); // T
      type = primitive.type;
    } else if (this.it.peek() instanceof tkn.Identifier) {
      const identifier = this.it.next(); // T
      type = new typ.Type(identifier);
    }
    if (this.it.peek() === tkn.Construct.ARROW) {
      this.it.next(); // ->
      const domain = this.getType();
      type = new typ.FunType(type, domain);
    } else if (this.it.peek() === tkn.Construct.AARROW) {
      this.it.next(); // ->a
      const domain = this.getType();
      type = new typ.AsyncFunType(type, domain);
    }
    log('type: ', type);
    return type;
  }

  termLet() {
    log('termLet, peek:', this.it.peek());

    this.it.next(); // let
    assertInstance(this.it.peek(), tkn.Identifier);
    const id = new trm.Variable(this.it.next()); // x
    assert(this.it.peek(), tkn.Construct.EQUAL);
    this.it.next(); // =
    const t1 = this.getTerm(); // t1
    assert(this.it.peek(), tkn.Keyword.IN);
    this.it.next(); // in
    const t2 = this.getTerm(); // t2
    return new trm.Let(id, t1, t2);
  }

  termAsyncFun() {
    log('termAsyncFun, peek:', this.it.peek());

    this.it.next(); // async
    assert(this.it.peek(), tkn.Keyword.FUN);
    this.it.next(); // fun
    assertInstance(this.it.peek(), tkn.Identifier);
    const arg = new trm.Variable(this.it.next()); // x
    assert(this.it.peek(), tkn.Construct.COLON);
    this.it.next(); // :
    const type = this.getType(); // T
    // assertion?
    assert(this.it.peek(), tkn.Construct.EQUAL);
    this.it.next(); // =
    const body = this.getTerm(); // t
    return new trm.AsyncFun(arg, type, body);
  }

  termFun() {
    log('termFun, peek:', this.it.peek());

    this.it.next(); // fun
    assertInstance(this.it.peek(), tkn.Identifier);
    const arg = new trm.Variable(this.it.next()); // x
    assert(this.it.peek(), tkn.Construct.COLON);
    this.it.next(); // :
    const type = this.getType(); // T
    // assertion?
    assert(this.it.peek(), tkn.Construct.EQUAL);
    this.it.next(); // =
    const body = this.getTerm(); // t
    return new trm.Fun(arg, type, body);
  }

}

module.exports = Parser;