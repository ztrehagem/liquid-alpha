const fs = require('fs');
const path = require('path');
const liquid = require('./');

// process.argv: node exp filename
const filename = process.argv[2];
if (!filename) {
  console.error('no input lqd file');
  process.exit(1);
}

const lqd = fs.readFileSync(filename).toString();
liquid.exec(lqd);
