const { Keyword, Construct, Identifier, Primitive, Literal } = require('./token');

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
    // console.log('tryAsConstruct', this.code.substring(this.head, this.head + 10));
    
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
    const [ key ] = Object.entries(Keyword.kinds).find(([ key, str ]) => str === word) || [];
    if (!key) return null;
    return Keyword[key];
  }

  asLiteral(word) {
    if ('true false'.split(' ').includes(word)) { // Bool
      // return new Literal(word === 'true'); // jsプリミティブに変換
      return new Literal(word);
    }
    if (word.match(/^\d+(?:\.\d+)?$/)) { // Number
      // return new Literal(parseFloat(word)); // jsプリミティブに変換
      return new Literal(word);
    }
    return null;
  }

  asPrimitive(word) {
    if ('and not Bool'.split(' ').includes(word)) {
      return new Primitive(word);
    }
    return null;
  }

  asIdentifier(word) {
    if (word.match(/^[A-Za-z_]\w*$/)) {
      return new Identifier(word);
    }
    return null;
  }
}

module.exports = Lexer;
