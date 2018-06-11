const escodegen = require('escodegen');
const parser = require('./parser');

exports.exec = (lqd) => {
  console.log('-------- parse --------');
  const ast = parser.parse(lqd);
  console.log('-------- generate --------');
  const js = escodegen.generate(ast);
  console.log('-------- output --------');
  console.log(js);
};
