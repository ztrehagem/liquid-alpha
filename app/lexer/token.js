const LITERAL = 'literal';
const IDENTIFIER = 'identifier';
const CONSTRUCT = 'construct';
const KEYWORD = 'keyword';

class Token {
  constructor(kind, str) {
    this.kind = kind;
    this.str = str;
  }

  toString() {
    return this.str;
  }
}
Token.toString = () => "Token";

class Keyword extends Token {
  constructor(str) {
    super(KEYWORD, str);
  }
}
Keyword.toString = () => "Keyword";
Keyword.kinds = {
  ASYNC: 'async',
  FUN: 'fun',
  LET: 'let',
  IN: 'in',
};
for (const [key, str] of Object.entries(Keyword.kinds)) {
  Keyword[key] = new Keyword(str);
}

class Construct extends Token {
  constructor(str) {
    super(CONSTRUCT, str);
  }
}
Construct.toString = () => "Construct";
Construct.kinds = {
  BRACKET_L: '(',
  BRACKET_R: ')',
  PAIR_CAR: '.1',
  PAIR_CDR: '.2',
  COMMA: ',',
  EQUAL: '=',
  COLON: ':',
};
for (const [key, str] of Object.entries(Construct.kinds)) {
  Construct[key] = new Construct(str);
}

class Identifier extends Token {
  constructor(str) {
    super(IDENTIFIER, str)
  }
}
Identifier.toString = () => "Identifier";

class Literal extends Token {
  constructor(str) {
    super(LITERAL, str);
  }
}
Literal.toString = () => "Literal";

module.exports = {
  Token,
  Keyword,
  Construct,
  Identifier,
  Literal,
};