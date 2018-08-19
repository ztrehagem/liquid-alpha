#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const liquid = require('../dist');

const filename = process.argv[2];
if (!filename) {
  console.error('no input lqd file');
  process.exit(1);
}

const resolvedPath = path.resolve(filename);
const code = fs.readFileSync(resolvedPath).toString();
liquid.exec(code);
