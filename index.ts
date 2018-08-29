import { inspect } from 'util';
import Lexer from './app/lexer';
import Parser from './app/parser';

export const exec = async (lqd: string) => {
  try {
    console.log('-------- Liquid --------');
    console.log(lqd);
    console.log('-------- tokenize --------');
    const tokens = new Lexer(lqd).tokenize();
    console.log(tokens);
    console.log('-------- parse --------');
    const ast = new Parser(tokens).parse();
    console.log(inspect(ast, { depth: Infinity, colors: true }));
    console.log('-------- type check --------');
    ast.checkType();
    console.log(inspect(ast, { depth: Infinity, colors: true }));
    console.log('-------- compile --------');
    const compiled = ast.compile();
    console.log(inspect(compiled, { depth: Infinity, colors: true }));
    console.log('-------- core Liquid --------');
    console.log(compiled.toString());
    console.log('-------- evaluate --------');
    const evaluated = await compiled.evaluate();
    console.log('-------- result --------');
    console.log(inspect(evaluated, { depth: Infinity, colors: true }));
    console.log('-------- readable --------');
    console.log(evaluated.toString());
  } catch (error) {
    console.error('-------- error --------');
    console.error(error);
  }

  // console.log('-------- generate --------');
  // const js = escodegen.generate(ast);
  // console.log('-------- output --------');
  // console.log(js);
};
