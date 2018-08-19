import { inspect } from 'util';
import Lexer from './app/lexer';
import Parser from './app/parser';

export const exec = (lqd: string) => {
  console.log('-------- program --------');
  console.log(lqd);
  console.log('-------- tokenize --------');
  const tokens = new Lexer(lqd).tokenize();
  console.log(tokens);
  console.log('-------- parse --------');
  const ast = new Parser(tokens).parse();
  console.log(inspect(ast, { depth: Infinity, colors: true }));
  console.log('-------- typing --------');
  ast.checkType();
  console.log(inspect(ast, { depth: Infinity, colors: true }));
  console.log('-------- compiling --------');
  const compiled = ast.compile();
  console.log(inspect(compiled, { depth: Infinity, colors: true }));

  // console.log('-------- generate --------');
  // const js = escodegen.generate(ast);
  // console.log('-------- output --------');
  // console.log(js);
};