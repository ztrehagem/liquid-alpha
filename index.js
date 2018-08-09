const escodegen = require('escodegen');
const { Lexer } = require('./app/lexer');
const { Parser } = require('./app/parser');

exports.exec = (lqd) => {
  console.log('-------- tokenize --------');
  const tokens = new Lexer(lqd).tokenize();
  console.log(tokens);
  console.log('-------- parse --------');
  const ast = new Parser(tokens).parse();
  console.log(ast);
  // console.log('-------- generate --------');
  // const js = escodegen.generate(ast);
  // console.log('-------- output --------');
  // console.log(js);
};
