const wrd = require('./word');
const typ = require('./type');

const kinds = {
  LITERAL: 'literal',
  PRIMITIVE_FUN: 'primitive_fun',
  PRIMITIVE_TYPE: 'primitive_type',
  IDENTIFIER: 'identifier',
  CONSTRUCT: 'construct',
  KEYWORD: 'keyword',
};

class Token {
  constructor(kind, str) {
    this.kind = kind;
    this.str = str;
  }

  toString() {
    return this.str;
  }

  static toString() {
    return 'Token';
  }
}

class TypedToken extends Token {
  constructor(kind, str, type) {
    super(kind, str);
    this.type = type;
  }

  static toString() {
    return 'TypedToken';
  }
}

class Keyword extends Token {
  constructor(str) {
    super(kinds.KEYWORD, str);
  }

  static toString() {
    return 'Keyword';
  }
}
Keyword.ASYNC = new Keyword(wrd.ASYNC);
Keyword.FUN = new Keyword(wrd.FUN);
Keyword.LET = new Keyword(wrd.LET);
Keyword.IN = new Keyword(wrd.IN);

class Construct extends Token {
  constructor(str) {
    super(kinds.CONSTRUCT, str);
  }

  static toString() {
    return 'Construct';
  }
}
Construct.kinds = {
  BRACKET_L: '(',
  BRACKET_R: ')',
  PAIR_CAR: '.1',
  PAIR_CDR: '.2',
  COMMA: ',',
  EQUAL: '=',
  COLON: ':',
  ARROW: '->',
  AARROW: '->a',
};
for (const [key, str] of Object.entries(Construct.kinds)) {
  Construct[key] = new Construct(str);
}

class Identifier extends Token {
  constructor(str) {
    super(kinds.IDENTIFIER, str);
  }

  static toString() {
    return 'Identifier';
  }
}

class PrimitiveFun extends TypedToken {
  constructor(str, type) {
    super(kinds.PRIMITIVE_FUN, str, type);
  }

  static toString() {
    return 'PrimitiveFun';
  }
}
PrimitiveFun.AND = new PrimitiveFun(wrd.AND, new typ.FunType(new typ.PairType(typ.BOOL, typ.BOOL), typ.BOOL));
PrimitiveFun.NOT = new PrimitiveFun(wrd.NOT, new typ.FunType(typ.BOOL, typ.BOOL));

class PrimitiveType extends TypedToken {
  constructor(str, type) {
    super(kinds.PRIMITIVE_TYPE, str, type);
  }

  static toString() {
    return 'PrimitiveType';
  }
}
PrimitiveType.BOOL = new PrimitiveType(wrd.BOOL, typ.BOOL);
PrimitiveType.NUMBER = new PrimitiveType(wrd.NUMBER, typ.NUMBER);

class Literal extends TypedToken {
  constructor(str, type) {
    super(kinds.LITERAL, str, type);
  }

  static toString() {
    return 'Literal';
  }
}
Literal.TRUE = new Literal(wrd.TRUE, typ.BOOL);
Literal.FALSE = new Literal(wrd.FALSE, typ.BOOL);

module.exports = {
  Token,
  Keyword,
  Construct,
  Identifier,
  PrimitiveFun,
  PrimitiveType,
  Literal,
};