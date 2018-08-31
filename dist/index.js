"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./app/logger");
const lexer_1 = require("./app/lexer");
const parser_1 = require("./app/parser");
exports.exec = async (lqd) => {
    try {
        logger_1.log('-------- Liquid --------');
        logger_1.log(lqd);
        logger_1.log('\n-------- tokenize --------');
        const tokens = new lexer_1.default(lqd).tokenize();
        logger_1.inspect(tokens, 1);
        logger_1.log('\n-------- parse --------');
        const ast = new parser_1.default(tokens).parse();
        logger_1.inspect(ast);
        logger_1.log('\n-------- type check --------');
        ast.checkType();
        logger_1.inspect(ast);
        logger_1.log('\n-------- compile --------');
        const compiled = ast.compile();
        logger_1.inspect(compiled);
        logger_1.log('\n-------- core Liquid --------');
        logger_1.log(compiled.toString());
        logger_1.log('\n-------- evaluate --------');
        const evaluated = await compiled.evaluate();
        logger_1.log('\n-------- result --------');
        logger_1.inspect(evaluated);
        logger_1.log('\n-------- readable --------');
        logger_1.log(evaluated.toString());
    }
    catch (error) {
        error('\n-------- error --------');
        error(error);
    }
};
