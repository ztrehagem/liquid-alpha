const kinds = {
  LITERAL: 'literal',
  IDENTIFIER: 'identifier',
  CONSTRUCT: 'construct',
  KEYWORD: 'keyword',
};

class Token {
  constructor(kind, value) {
    this.kind = kind;
    this.value = value;
  }
}

class Keyword extends Token {
  constructor(str) {
    super(kinds.KEYWORD, str);
  }
}
Keyword.kinds = {
  ASYNC: 'async',
  FUN: 'fun',
  LET: 'let',
  IN: 'in',
};
for (const [key, str] of Object.entries(Keyword.kinds)) {
  Keyword[key] = str;
}

class Construct extends Token {
  constructor(str) {
    super(kinds.CONSTRUCT, str);
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
};
for (const [key, str] of Object.entries(Construct.kinds)) {
  Construct[key] = str;
}

class Identifier extends Token {
  constructor(label) {
    super(kinds.CONSTRUCT, label)
  }
}

class Literal extends Token {
  constructor(value) {
    super(kinds.LITERAL, value);
  }
}

module.exports = {
  Token,
  Keyword,
  Construct,
  Identifier,
  Literal,
  kinds,
};