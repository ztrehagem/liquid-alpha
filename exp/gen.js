const escodegen = require('escodegen');

const js = escodegen.generate({
  type: 'Literal',
  value: true,
});

console.log(js);
