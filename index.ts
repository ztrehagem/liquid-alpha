import { inspect } from 'util';
import Lexer from './app/lexer';
import Parser from './app/parser';

export const exec = (lqd: string) => {
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
  const evaluated = compiled.evaluate();
  console.log('-------- result --------');
  console.log(evaluated.toString());
// application->bodyにenvを持っていて，自分のenvのほうが強い

  // console.log('-------- generate --------');
  // const js = escodegen.generate(ast);
  // console.log('-------- output --------');
  // console.log(js);
};
