const wrd = require('./word');
const typ = require('./type');
const trm = require('./term');

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
  constructor(term) {
    super(kinds.PRIMITIVE_FUN, term.str, term.type);
    this.term = term;
  }

  toTerm() {
    return this.term;
  }

  static toString() {
    return 'PrimitiveFun';
  }
}
PrimitiveFun.AND = new PrimitiveFun(trm.Primitive.AND);
PrimitiveFun.NOT = new PrimitiveFun(trm.Primitive.NOT);

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

  toTerm() {
    switch (this) {
      case Literal.TRUE: return trm.Literal.TRUE;
      case Literal.FALSE: return trm.Literal.FALSE;
    }
    if (this.type === typ.NUMBER) {
      return new trm.Literal(this.str, this.type);
    }
    return null;
  }

  static toString() {
    return 'Literal';
  }
}
Literal.TRUE = new Literal(trm.Literal.TRUE.str, trm.Literal.TRUE.type);
Literal.FALSE = new Literal(trm.Literal.FALSE.str, trm.Literal.FALSE.type);

module.exports = {
  Token,
  Keyword,
  Construct,
  Identifier,
  PrimitiveFun,
  PrimitiveType,
  Literal,
};