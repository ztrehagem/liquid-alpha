const Iterator = require('../util/iterator');

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.it = new Iterator(tokens);
    this.ast = {};
  }

  parse() {

    for (const token of this.it) {
      
    }

    return this.ast;
  }

}

module.exports = {
  Parser,
};