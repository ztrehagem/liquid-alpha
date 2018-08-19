"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const iterator_1 = require("./util/iterator");
const tkn = require("./token");
const trm = require("./term");
const typ = require("./type");
const deep = (obj) => util_1.inspect(obj, { depth: Infinity, colors: true });
const log = (str, obj) => {
};
const isInstance = (instance, ...classes) => classes.some(clazz => instance instanceof clazz);
const throwSyntaxError = (actual, expect) => {
    const expectStr = Array.isArray(expect) ? expect.join('", "') : expect.toString();
    throw new Error(`syntax error: expected "${expectStr}" but got "${actual}"`);
};
const assert = (actual, expect) => {
    if (actual !== expect)
        throwSyntaxError(actual, expect);
};
const assertInstance = (object, clazz) => {
    if (!(object instanceof clazz))
        throwSyntaxError(object, clazz.name);
};
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.it = new iterator_1.default(tokens);
    }
    parse() {
        return this.getTerm();
    }
    getSingleTerm() {
        log('getSingleTerm, peek:', this.it.peek());
        let term = null;
        const peek = this.it.peek();
        if (peek === tkn.Construct.BRACKET_L) {
            this.it.next();
            const t1 = this.getTerm();
            if (this.it.peek() === tkn.Construct.COMMA) {
                this.it.next();
                const t2 = this.getTerm();
                assert(this.it.peek(), tkn.Construct.BRACKET_R);
                this.it.next();
                term = new trm.Pair(t1, t2);
            }
            else if (this.it.peek() === tkn.Construct.BRACKET_R) {
                this.it.next();
                term = t1;
            }
            else {
                throwSyntaxError(peek, [tkn.Construct.COMMA, tkn.Construct.BRACKET_R]);
            }
        }
        else if (peek instanceof tkn.Keyword) {
            if (peek === tkn.Keyword.ASYNC)
                term = this.termAsyncFun();
            else if (peek === tkn.Keyword.FUN)
                term = this.termFun();
            else if (peek === tkn.Keyword.LET)
                term = this.termLet();
            else
                throwSyntaxError(peek, [tkn.Keyword.ASYNC, tkn.Keyword.FUN, tkn.Keyword.LET]);
        }
        else if (peek instanceof tkn.Identifier) {
            const identifier = this.it.next();
            term = new trm.Variable(identifier.toString());
        }
        else if (peek instanceof tkn.PrimitiveFun) {
            this.it.next();
            term = peek.toTerm();
        }
        else if (peek instanceof tkn.Literal) {
            this.it.next();
            term = peek.toTerm();
        }
        else {
            throwSyntaxError(peek, [tkn.Keyword, tkn.Identifier, tkn.PrimitiveFun, tkn.Literal, tkn.Construct.BRACKET_L]);
        }
        if (this.it.peek() === tkn.Construct.PAIR_CAR) {
            this.it.next();
            term = new trm.PairCar(term);
        }
        else if (this.it.peek() === tkn.Construct.PAIR_CDR) {
            this.it.next();
            term = new trm.PairCdr(term);
        }
        return term;
    }
    hasNextArgTerm() {
        const peek = this.it.peek();
        if (isInstance(peek, tkn.Identifier, tkn.PrimitiveFun, tkn.Literal))
            return true;
        if ([tkn.Construct.BRACKET_L, tkn.Keyword.ASYNC, tkn.Keyword.FUN, tkn.Keyword.LET].includes(peek))
            return true;
        return false;
    }
    getTerm() {
        log('getTerm, peek:', this.it.peek());
        let term = this.getSingleTerm();
        while (this.hasNextArgTerm()) {
            const t2 = this.getSingleTerm();
            term = new trm.Application(term, t2);
        }
        log('term:', term);
        return term;
    }
    getType() {
        log('getType, peek:', this.it.peek());
        let type = null;
        const peek = this.it.peek();
        if (peek === tkn.Construct.BRACKET_L) {
            this.it.next();
            type = this.getType();
            if (this.it.peek() === tkn.Construct.COMMA) {
                this.it.next();
                const cdrType = this.getType();
                assert(this.it.peek(), tkn.Construct.BRACKET_R);
                this.it.next();
                type = new typ.PairType(type, cdrType);
            }
            else if (this.it.peek() === tkn.Construct.BRACKET_R) {
                this.it.next();
            }
            else {
                throwSyntaxError(this.it.peek(), [tkn.Construct.COMMA, tkn.Construct.BRACKET_R]);
            }
        }
        else if (peek instanceof tkn.PrimitiveType) {
            this.it.next();
            type = peek.type;
        }
        else if (peek instanceof tkn.Identifier) {
            this.it.next();
            type = new typ.Type(peek.toString());
        }
        if (this.it.peek() === tkn.Construct.ARROW) {
            this.it.next();
            const domain = this.getType();
            type = new typ.FunType(type, domain);
        }
        else if (this.it.peek() === tkn.Construct.AARROW) {
            this.it.next();
            const domain = this.getType();
            type = new typ.AsyncFunType(type, domain);
        }
        log('type: ', type);
        return type;
    }
    termLet() {
        log('termLet, peek:', this.it.peek());
        this.it.next();
        assertInstance(this.it.peek(), tkn.Identifier);
        const id = new trm.Variable(this.it.next().toString());
        assert(this.it.peek(), tkn.Construct.EQUAL);
        this.it.next();
        const t1 = this.getTerm();
        assert(this.it.peek(), tkn.Keyword.IN);
        this.it.next();
        const t2 = this.getTerm();
        return new trm.Let(id, t1, t2);
    }
    termAsyncFun() {
        log('termAsyncFun, peek:', this.it.peek());
        this.it.next();
        assert(this.it.peek(), tkn.Keyword.FUN);
        this.it.next();
        assertInstance(this.it.peek(), tkn.Identifier);
        const arg = new trm.Variable(this.it.next().toString());
        assert(this.it.peek(), tkn.Construct.COLON);
        this.it.next();
        const type = this.getType();
        assert(this.it.peek(), tkn.Construct.EQUAL);
        this.it.next();
        const body = this.getTerm();
        return new trm.AsyncFun(arg, type, body);
    }
    termFun() {
        log('termFun, peek:', this.it.peek());
        this.it.next();
        assertInstance(this.it.peek(), tkn.Identifier);
        const arg = new trm.Variable(this.it.next().toString());
        assert(this.it.peek(), tkn.Construct.COLON);
        this.it.next();
        const type = this.getType();
        assert(this.it.peek(), tkn.Construct.EQUAL);
        this.it.next();
        const body = this.getTerm();
        return new trm.Fun(arg, type, body);
    }
}
exports.default = Parser;
