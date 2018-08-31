import { log, warn, error, inspect } from './logger';
import * as tkn from './token';

export default class Lexper {

  code: string;
  head: number;
  tokens: tkn.Token[];

  constructor(code: string) {
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

      const token =
        tkn.Keyword.fromStr(word) ||
        tkn.PrimitiveFun.fromStr(word) ||
        tkn.PrimitiveType.fromStr(word) ||
        tkn.Literal.fromStr(word) ||
        tkn.Identifier.fromStr(word);
      if (token) {
        this.tokens.push(token);
        continue;
      }

      warn("couldn't tokenize:", word);
    }

    return this.tokens;
  }

  asConstruct() {
    const match = this.code.substring(this.head).match(/^\.[12]|\S/);
    if (!match) return null;
    let [word] = match;
    const { index } = match;
    if (word === '-') [word] = this.code.substring(this.head + index).match(/^->a?/);
    const construct = tkn.Construct.fromStr(word);
    if (!construct) return null;
    this.head += index + word.length;
    return construct;
  }

  getWord() {
    const match = this.code.substring(this.head).match(/\w+/);
    if (!match) return null;
    const [word] = match;
    const { index } = match;
    this.head += index + word.length;
    return word;
  }
}