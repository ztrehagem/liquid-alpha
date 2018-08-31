"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const tkn = require("./token");
class Lexper {
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
            const construct = this.asConstruct();
            if (construct) {
                this.tokens.push(construct);
                continue;
            }
            const word = this.getWord();
            const token = tkn.Keyword.fromStr(word) ||
                tkn.PrimitiveFun.fromStr(word) ||
                tkn.PrimitiveType.fromStr(word) ||
                tkn.Literal.fromStr(word) ||
                tkn.Identifier.fromStr(word);
            if (token) {
                this.tokens.push(token);
                continue;
            }
            logger_1.warn("couldn't tokenize:", word);
        }
        return this.tokens;
    }
    asConstruct() {
        const match = this.code.substring(this.head).match(/^\.[12]|\S/);
        if (!match)
            return null;
        let [word] = match;
        const { index } = match;
        if (word === '-')
            [word] = this.code.substring(this.head + index).match(/^->a?/);
        const construct = tkn.Construct.fromStr(word);
        if (!construct)
            return null;
        this.head += index + word.length;
        return construct;
    }
    getWord() {
        const match = this.code.substring(this.head).match(/\w+/);
        if (!match)
            return null;
        const [word] = match;
        const { index } = match;
        this.head += index + word.length;
        return word;
    }
}
exports.default = Lexper;
