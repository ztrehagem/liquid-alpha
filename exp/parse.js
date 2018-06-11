const esprima = require('esprima');
const path = require('path');
const fs = require('fs');

const program = fs.readFileSync(path.join(__dirname, './program.js')).toString();

const ast = esprima.parse(program);

console.log(require('util').inspect(ast, { depth: null }));
