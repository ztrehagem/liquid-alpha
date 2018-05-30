const SPACES = [' ', '\n', undefined];
const LITERAL_CHAR = /\w+/;

const Token = {
  literal(str) {
    return {
      type: Token.LITERAL,
      value: str,
    };
  },
  LITERAL: 'literal',
};

class Tokenizer {
  constructor(code) {
    this.code = code;
    this.head = 0;
    this.tokens = [];
  }

  tokenize() {
    while (this.head < this.code.length) {
      this.skipSpaces();
      const c = this.code[this.head];
      // TODO 記号系

      const literal = this.getLiteral();
      if (literal) {
        this.tokens.push(Token.literal(literal));
        continue;
      }
    }
    return this.tokens;
  }

  skipSpaces() {
    while (SPACES.includes(this.code[this.head])) this.head++;
  }

  getLiteral() {
    const match = this.code.substring(this.head).match(LITERAL_CHAR);
    if (!match) return null;
    const [ literal, index ] = match;
    this.head += index + literal.length;
    return literal;
  }
}

module.exports = {
  Token,
  Tokenizer,
};
