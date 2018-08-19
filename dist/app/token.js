"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wrd = require("./word");
const typ = require("./type");
const trm = require("./term");
var Kind;
(function (Kind) {
    Kind[Kind["LITERAL"] = 0] = "LITERAL";
    Kind[Kind["PRIMITIVE_FUN"] = 1] = "PRIMITIVE_FUN";
    Kind[Kind["PRIMITIVE_TYPE"] = 2] = "PRIMITIVE_TYPE";
    Kind[Kind["IDENTIFIER"] = 3] = "IDENTIFIER";
    Kind[Kind["CONSTRUCT"] = 4] = "CONSTRUCT";
    Kind[Kind["KEYWORD"] = 5] = "KEYWORD";
})(Kind = exports.Kind || (exports.Kind = {}));
;
class Token {
    constructor(kind, str) {
        this.kind = kind;
        this.str = str;
    }
    toString() {
        return this.str;
    }
    static toString() {
        return this.name;
    }
}
exports.Token = Token;
class TypedToken extends Token {
    constructor(kind, str, type) {
        super(kind, str);
        this.type = type;
    }
    static toString() {
        return this.name;
    }
}
exports.TypedToken = TypedToken;
class Keyword extends Token {
    constructor(str) {
        super(Kind.KEYWORD, str);
    }
    static fromStr(str) {
        switch (str) {
            case this.ASYNC.str: return this.ASYNC;
            case this.FUN.str: return this.FUN;
            case this.LET.str: return this.LET;
            case this.IN.str: return this.IN;
            default: return null;
        }
    }
    static toString() {
        return this.name;
    }
}
Keyword.ASYNC = new Keyword(wrd.ASYNC);
Keyword.FUN = new Keyword(wrd.FUN);
Keyword.LET = new Keyword(wrd.LET);
Keyword.IN = new Keyword(wrd.IN);
exports.Keyword = Keyword;
class Construct extends Token {
    constructor(str) {
        super(Kind.CONSTRUCT, str);
    }
    static fromStr(word) {
        switch (word) {
            case this.BRACKET_L.str: return this.BRACKET_L;
            case this.BRACKET_R.str: return this.BRACKET_R;
            case this.PAIR_CAR.str: return this.PAIR_CAR;
            case this.PAIR_CDR.str: return this.PAIR_CDR;
            case this.COMMA.str: return this.COMMA;
            case this.EQUAL.str: return this.EQUAL;
            case this.COLON.str: return this.COLON;
            case this.ARROW.str: return this.ARROW;
            case this.AARROW.str: return this.AARROW;
            default: return null;
        }
    }
    static toString() {
        return this.name;
    }
}
Construct.BRACKET_L = new Construct('(');
Construct.BRACKET_R = new Construct(')');
Construct.PAIR_CAR = new Construct('.1');
Construct.PAIR_CDR = new Construct('.2');
Construct.COMMA = new Construct(',');
Construct.EQUAL = new Construct('=');
Construct.COLON = new Construct(':');
Construct.ARROW = new Construct('->');
Construct.AARROW = new Construct('->a');
exports.Construct = Construct;
class Identifier extends Token {
    constructor(str) {
        super(Kind.IDENTIFIER, str);
    }
    static fromStr(str) {
        if (str.match(/^[A-Za-z_]\w*$/)) {
            return new Identifier(str);
        }
        return null;
    }
    static toString() {
        return this.name;
    }
}
exports.Identifier = Identifier;
class PrimitiveFun extends TypedToken {
    constructor(term) {
        super(Kind.PRIMITIVE_FUN, term.str, term.type);
        this.term = term;
    }
    toTerm() {
        return this.term;
    }
    static fromStr(str) {
        switch (str) {
            case this.AND.str: return this.AND;
            case this.NOT.str: return this.NOT;
            default: return null;
        }
    }
    static toString() {
        return this.name;
    }
}
PrimitiveFun.AND = new PrimitiveFun(trm.Primitive.AND);
PrimitiveFun.NOT = new PrimitiveFun(trm.Primitive.NOT);
exports.PrimitiveFun = PrimitiveFun;
class PrimitiveType extends TypedToken {
    constructor(str, type) {
        super(Kind.PRIMITIVE_TYPE, str, type);
    }
    static fromStr(str) {
        switch (str) {
            case this.BOOL.str: return this.BOOL;
            case this.NUMBER.str: return this.NUMBER;
            default: return null;
        }
    }
    static toString() {
        return this.name;
    }
}
PrimitiveType.BOOL = new PrimitiveType(wrd.BOOL, typ.BOOL);
PrimitiveType.NUMBER = new PrimitiveType(wrd.NUMBER, typ.NUMBER);
exports.PrimitiveType = PrimitiveType;
class Literal extends TypedToken {
    constructor(str, type) {
        super(Kind.LITERAL, str, type);
    }
    toTerm() {
        switch (this) {
            case Literal.TRUE: return trm.Literal.TRUE;
            case Literal.FALSE: return trm.Literal.FALSE;
        }
        if (this.type === typ.NUMBER) {
            return new trm.Literal(this.str, this.type);
        }
        return null;
    }
    static fromStr(str) {
        switch (str) {
            case this.TRUE.str: return this.TRUE;
            case this.FALSE.str: return this.FALSE;
        }
        if (str.match(/^\d+(?:\.\d+)?$/)) {
            return new Literal(str, typ.NUMBER);
        }
        return null;
    }
    static toString() {
        return this.name;
    }
}
Literal.TRUE = new Literal(trm.Literal.TRUE.str, trm.Literal.TRUE.type);
Literal.FALSE = new Literal(trm.Literal.FALSE.str, trm.Literal.FALSE.type);
exports.Literal = Literal;
