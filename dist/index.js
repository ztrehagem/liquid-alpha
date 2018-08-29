"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const lexer_1 = require("./app/lexer");
const parser_1 = require("./app/parser");
exports.exec = async (lqd) => {
    try {
        console.log('-------- Liquid --------');
        console.log(lqd);
        console.log('-------- tokenize --------');
        const tokens = new lexer_1.default(lqd).tokenize();
        console.log(tokens);
        console.log('-------- parse --------');
        const ast = new parser_1.default(tokens).parse();
        console.log(util_1.inspect(ast, { depth: Infinity, colors: true }));
        console.log('-------- type check --------');
        ast.checkType();
        console.log(util_1.inspect(ast, { depth: Infinity, colors: true }));
        console.log('-------- compile --------');
        const compiled = ast.compile();
        console.log(util_1.inspect(compiled, { depth: Infinity, colors: true }));
        console.log('-------- core Liquid --------');
        console.log(compiled.toString());
        console.log('-------- evaluate --------');
        const evaluated = await compiled.evaluate();
        console.log('-------- result --------');
        console.log(util_1.inspect(evaluated, { depth: Infinity, colors: true }));
        console.log('-------- readable --------');
        console.log(evaluated.toString());
    }
    catch (error) {
        console.error('-------- error --------');
        console.error(error);
    }
};
