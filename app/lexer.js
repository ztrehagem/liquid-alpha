const { Keyword, Construct, Identifier, Primitive, Literal } = require('./token');
const wrd = require('./word');

class Lexer {
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

      // プリミティブ
      const primitive = this.asPrimitive(word);
      if (primitive) {
        this.tokens.push(primitive);
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
    const match = this.code.substring(this.head).match(/^\.[12]|\S/);
    if (!match) return null;
    let [ word ] = match;
    const { index } = match;
    if (word === '-') [ word ] = this.code.substring(this.head + index).match(/^->a?/);
    const [ key ] = Object.entries(Construct.kinds).find(([ key, str ]) => str === word) || [];
    if (!key) return null;
    this.head += index + word.length;
    return Construct[key];
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
    switch (word) {
      case wrd.ASYNC: return Keyword.ASYNC;
      case wrd.FUN: return Keyword.FUN;
      case wrd.LET: return Keyword.LET;
      case wrd.IN: return Keyword.IN;
      default: return null;
    }
  }

  asLiteral(word) {
    switch (word) {
      case wrd.TRUE: return Literal.TRUE;
      case wrd.FALSE: return Literal.FALSE;
    }
    if (word.match(/^\d+(?:\.\d+)?$/)) { // Number
      return Literal.asNumber(word);
    }
    return null;
  }

  asPrimitive(word) {
    switch (word) {
      case wrd.AND: return Primitive.AND;
      case wrd.NOT: return Primitive.NOT;
      case wrd.BOOL: return Primitive.BOOL;
      case wrd.NUMBER: return Primitive.NUMBER;
      default: return null;
    }
  }

  asIdentifier(word) {
    if (word.match(/^[A-Za-z_]\w*$/)) {
      return new Identifier(word);
    }
    return null;
  }
}

module.exports = Lexer;
