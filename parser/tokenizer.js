const SPACES = [' ', '\n'];

const CONSTRUCTS = [
  '(',
  ')',
  '.1',
  '.2',
  ',',
  '=',
  ':',
];

const KEYWORDS = [
  'fun',
  'let',
  'in',
];

const Token = {
  LITERAL: 'literal',
  IDENTIFIER: 'identifier',
  CONSTRUCT: 'construct',
  KEYWORD: 'keyword',
};

const factory = {
  literal: (type, value) => ({
    kind: Token.LITERAL,
    type,
    value,
  }),
  identifier: (label) => ({
    kind: Token.IDENTIFIER,
    label,
  }),
  construct: (str) => ({
    kind: Token.CONSTRUCT,
    str,
  }),
  keyword: (str) => ({
    kind: Token.KEYWORD,
    str,
  }),
};

class Tokenizer {
  constructor(code) {
    this.code = code;
    this.head = 0;
    this.tokens = [];
  }

  tokenize() {
    while (this.head < this.code.length) {

      if (this.code.substring(this.head).match(/^[ \n]+$/)) {
        break;
      }

      // 演算子とか
      const construct = this.tryAsConstruct();
      if (construct) {
        this.tokens.push(construct);
        continue;
      }

      const word = this.getWord();

      // 予約語
      const keyword = this.asKeyword(word);
      if (keyword) {
        this.tokens.push(keyword);
        continue;
      }

      // リテラル
      const literal = this.asLiteral(word);
      if (literal) {
        this.tokens.push(literal);
        continue;
      }

      // 識別子（変数とか）
      const identifier = this.asIdentifier(word);
      if (identifier) {
        this.tokens.push(identifier);
        continue;
      }

      console.warn("couldn't tokenize:", word);
    }

    return this.tokens;
  }

  tryAsConstruct() {
    const match = this.code.substring(this.head).match(/^\.[12]|[^ \n]/);
    if (!match) return null;
    const [ construct ] = match;
    const { index } = match;
    if (CONSTRUCTS.includes(construct)) {
      this.head += index + construct.length;
      return factory.construct(construct);
    }
    return null;
  }

  getWord() {
    const match = this.code.substring(this.head).match(/\w+/);
    if (!match) return null;
    const [ word ] = match;
    const { index } = match;
    this.head += index + word.length;
    return word;
  }

  asKeyword(word) {
    if (KEYWORDS.includes(word)) {
      return factory.keyword(word);
    }
    return null;
  }

  asLiteral(word) {
    if (word === 'true' || word === 'false') {
      return factory.literal('boolean', word === 'true');
    }
    if (word.match(/^\d+(?:\.\d+)?$/)) {
      return factory.literal('number', parseFloat(word));
    }
    return null;
  }

  asIdentifier(word) {
    if (word.match(/^[A-Za-z_]\w*$/)) {
      return factory.identifier(word);
    }
    return null;
  }
}

module.exports = {
  CONSTRUCTS,
  KEYWORDS,
  Token,
  Tokenizer,
};
