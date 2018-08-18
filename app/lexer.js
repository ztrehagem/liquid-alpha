const tkn = require('./token');
const wrd = require('./word');
const typ = require('./type');

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
      const construct = this.asConstruct();
      if (construct) {
        this.tokens.push(construct);
        continue;
      }

      const word = this.getWord();

      // 予約語
      // プリミティブ関数
      // プリミティブ型
      // リテラル（Bool）
      const fixedWord = this.asFixedWord(word);
      if (fixedWord) {
        this.tokens.push(fixedWord);
        continue;
      }

      // リテラル
      // 識別子（変数）
      const mutableWord = this.asMutableWord(word);
      if (mutableWord) {
        this.tokens.push(mutableWord);
        continue;
      }

      console.warn("couldn't tokenize:", word);
    }

    return this.tokens;
  }

  asConstruct() {
    const match = this.code.substring(this.head).match(/^\.[12]|\S/);
    if (!match) return null;
    let [ word ] = match;
    const { index } = match;
    if (word === '-') [ word ] = this.code.substring(this.head + index).match(/^->a?/);
    const [ key ] = Object.entries(tkn.Construct.kinds).find(([ key, str ]) => str === word) || [];
    if (!key) return null;
    this.head += index + word.length;
    return tkn.Construct[key];
  }

  getWord() {
    const match = this.code.substring(this.head).match(/\w+/);
    if (!match) return null;
    const [ word ] = match;
    const { index } = match;
    this.head += index + word.length;
    return word;
  }

  asFixedWord(word) {
    switch (word) {
      case wrd.ASYNC: return tkn.Keyword.ASYNC;
      case wrd.FUN: return tkn.Keyword.FUN;
      case wrd.LET: return tkn.Keyword.LET;
      case wrd.IN: return tkn.Keyword.IN;
      case wrd.AND: return tkn.PrimitiveFun.AND;
      case wrd.NOT: return tkn.PrimitiveFun.NOT;
      case wrd.BOOL: return tkn.PrimitiveType.BOOL;
      case wrd.NUMBER: return tkn.PrimitiveType.NUMBER;
      case wrd.TRUE: return tkn.Literal.TRUE;
      case wrd.FALSE: return tkn.Literal.FALSE;
      default: return null;
    }
  }

  asMutableWord(word) {
    if (word.match(/^\d+(?:\.\d+)?$/)) // Number
      return new tkn.Literal(word, typ.NUMBER);
    if (word.match(/^[A-Za-z_]\w*$/)) // Identifier
      return new tkn.Identifier(word);
      
    return null;
  }
}

module.exports = Lexer;
