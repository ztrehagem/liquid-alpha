const fs = require('fs');
const liquid = require('./');

const lqd = fs.readFileSync('./lqd/test1.lqd').toString();
liquid.exec(lqd);
