import * as wrd from './word';
import * as typ from './type';
import * as trm from './term';

export enum Kind {
  LITERAL,
  PRIMITIVE_FUN,
  PRIMITIVE_TYPE,
  IDENTIFIER,
  CONSTRUCT,
  KEYWORD,
};

export class Token {
  kind: Kind;
  str: string;

  constructor(kind: Kind, str: string) {
    this.kind = kind;
    this.str = str;
  }

  toString() {
    return this.str;
  }

  static toString() {
    return this.name;
  }
}

export class TypedToken extends Token {
  type: typ.Type;

  constructor(kind: Kind, str: string, type: typ.Type) {
    super(kind, str);
    this.type = type;
  }

  static toString() {
    return this.name;
  }
}

export class Keyword extends Token {
  static ASYNC: Keyword = new Keyword(wrd.ASYNC);
  static FUN: Keyword = new Keyword(wrd.FUN);
  static LET: Keyword = new Keyword(wrd.LET);
  static IN: Keyword = new Keyword(wrd.IN);

  constructor(str: string) {
    super(Kind.KEYWORD, str);
  }

  static fromStr(str: string) {
    switch (str) {
      case this.ASYNC.str: return this.ASYNC;
      case this.FUN.str: return this.FUN;
      case this.LET.str: return this.LET;
      case this.IN.str: return this.IN;
      default: return null;
    }
  }

  static toString() {
    return this.name;
  }
}

export class Construct extends Token {
  static BRACKET_L: Construct = new Construct('(');
  static BRACKET_R: Construct = new Construct(')');
  static PAIR_CAR: Construct = new Construct('.1');
  static PAIR_CDR: Construct = new Construct('.2');
  static COMMA: Construct = new Construct(',');
  static EQUAL: Construct = new Construct('=');
  static COLON: Construct = new Construct(':');
  static ARROW: Construct = new Construct('->');
  static AARROW: Construct = new Construct('->a');

  constructor(str: string) {
    super(Kind.CONSTRUCT, str);
  }

  static fromStr(word: string) {
    switch (word) {
      case this.BRACKET_L.str: return this.BRACKET_L;
      case this.BRACKET_R.str: return this.BRACKET_R;
      case this.PAIR_CAR.str: return this.PAIR_CAR;
      case this.PAIR_CDR.str: return this.PAIR_CDR;
      case this.COMMA.str: return this.COMMA;
      case this.EQUAL.str: return this.EQUAL;
      case this.COLON.str: return this.COLON;
      case this.ARROW.str: return this.ARROW;
      case this.AARROW.str: return this.AARROW;
      default: return null;
    }
  }

  static toString() {
    return this.name;
  }
}

export class Identifier extends Token {
  constructor(str: string) {
    super(Kind.IDENTIFIER, str);
  }

  static fromStr(str: string) {
    if (str.match(/^[A-Za-z_]\w*$/)) {
      return new Identifier(str);
    }
    return null;
  }

  static toString() {
    return this.name;
  }
}

export class PrimitiveFun extends TypedToken {
  term: trm.Primitive;
  static AND: PrimitiveFun = new PrimitiveFun(trm.Primitive.AND);
  static NOT: PrimitiveFun = new PrimitiveFun(trm.Primitive.NOT);

  constructor(term: trm.Primitive) {
    super(Kind.PRIMITIVE_FUN, term.str, term.type);
    this.term = term;
  }

  toTerm() {
    return this.term;
  }

  static fromStr(str: string) {
    switch (str) {
      case this.AND.str: return this.AND;
      case this.NOT.str: return this.NOT;
      default: return null;
    }
  }

  static toString() {
    return this.name;
  }
}

export class PrimitiveType extends TypedToken {
  static BOOL: PrimitiveType = new PrimitiveType(wrd.BOOL, typ.BOOL);
  static NUMBER: PrimitiveType = new PrimitiveType(wrd.NUMBER, typ.NUMBER);

  constructor(str: string, type: typ.Type) {
    super(Kind.PRIMITIVE_TYPE, str, type);
  }

  static fromStr(str: string) {
    switch (str) {
      case this.BOOL.str: return this.BOOL;
      case this.NUMBER.str: return this.NUMBER;
      default: return null;
    }
  }

  static toString() {
    return this.name;
  }
}

export class Literal extends TypedToken {
  static TRUE: Literal = new Literal(trm.Value.TRUE.str, trm.Value.TRUE.type);
  static FALSE: Literal = new Literal(trm.Value.FALSE.str, trm.Value.FALSE.type);

  constructor(str: string, type: typ.Type) {
    super(Kind.LITERAL, str, type);
  }

  toTerm() {
    switch (this) {
      case Literal.TRUE: return trm.Value.TRUE;
      case Literal.FALSE: return trm.Value.FALSE;
    }
    if (this.type === typ.NUMBER) {
      return new trm.Value(this.str, this.type);
    }
    return null;
  }

  static fromStr(str: string) {
    switch (str) {
      case this.TRUE.str: return this.TRUE;
      case this.FALSE.str: return this.FALSE;
    }
    if (str.match(/^\d+(?:\.\d+)?$/)) {
      return new Literal(str, typ.NUMBER);
    }
    return null;
  }

  static toString() {
    return this.name;
  }
}
