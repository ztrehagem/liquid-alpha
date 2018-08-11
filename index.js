const { inspect } = require('util');
const escodegen = require('escodegen');
const Lexer = require('./app/lexer');
const Parser = require('./app/parser');
const Typer = require('./app/typer');

exports.exec = (lqd) => {
  console.log('-------- program --------');
  console.log(lqd);
  console.log('-------- tokenize --------');
  const tokens = new Lexer(lqd).tokenize();
  console.log(tokens);
  console.log('-------- parse --------');
  const ast = new Parser(tokens).parse();
  console.log(inspect(ast, { depth: Infinity, colors: true }));
  console.log('-------- typing --------');
  const typedAst = new Typer(ast).check();
  console.log(inspect(typedAst, { depth: Infinity, colors: true }));

  // console.log('-------- generate --------');
  // const js = escodegen.generate(ast);
  // console.log('-------- output --------');
  // console.log(js);
};
