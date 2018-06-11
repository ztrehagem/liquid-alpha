const { Tokenizer, Token } = require('./tokenizer');

module.exports = class Parser {
  constructor(code) {
    this.code = code;
    this.head = 0;
  }

  parse() {
    const tokens = new Tokenizer(this.code).tokenize();
    console.log(tokens);
    const ast = {};

    while (this.head < tokens.length) {
      const token = tokens[this.head];

      // switch (token.kind) {
      //   case Token.LITERAL:
          ast.type = 'Literal';
          ast.value = token.value === 'true' ? true : false;
          this.head++;
      //     break;
      // }
    }

    console.log(ast);
    return ast;
  }
}
