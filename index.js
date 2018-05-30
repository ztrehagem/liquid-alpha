const escodegen = require('escodegen');
const parser = require('./parser');

exports.exec = (lqd) => {
  console.log('-------- parseing --------');
  const ast = parser.parse(lqd);
  console.log('-------- generating --------');
  const js = escodegen.generate(ast);
  console.log('-------- output --------');
  console.log(js);
};
