const Parser = require('./parser');

exports.parse = (lqd) => {
  const parser = new Parser(lqd);
  return parser.parse();
};
