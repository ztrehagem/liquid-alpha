import { log, inspect, setSilent } from './app/logger';
import Lexer from './app/lexer';
import Parser from './app/parser';

export type Options = {
  silent?: boolean,
};

export const exec = async (lqd: string, options: Options = {}) => {
  setSilent(!!options.silent);

  try {
    log('-------- Liquid --------');
    log(lqd);
    log('\n-------- tokenize --------');
    const tokens = new Lexer(lqd).tokenize();
    inspect(tokens, 1);
    log('\n-------- parse --------');
    const ast = new Parser(tokens).parse();
    inspect(ast);
    log('\n-------- size --------');
    log(ast.size);
    log('\n-------- type check --------');
    ast.checkType();
    inspect(ast);
    log('\n-------- compile --------');
    const compiled = ast.compile();
    inspect(compiled);
    log('\n-------- core Liquid --------');
    log(compiled.toString());
    log('\n-------- evaluate --------');
    const evaluated = await compiled.evaluate();
    log('\n-------- result --------');
    inspect(evaluated);
    log('\n-------- readable --------');
    log(evaluated.toString());
  } catch (error) {
    error('\n-------- error --------');
    error(error);
  }

  // log('-------- generate --------');
  // const js = escodegen.generate(ast);
  // log('-------- output --------');
  // log(js);
};
