"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const chalk_1 = require("chalk");
const idColor = (() => {
    switch (process.pid % 5) {
        case 0: return chalk_1.default.cyan;
        case 1: return chalk_1.default.magenta;
        case 2: return chalk_1.default.green;
        case 3: return chalk_1.default.yellow;
        case 4: return chalk_1.default.redBright;
    }
})();
let child = false;
let silent = false;
const idStr = idColor(process.pid.toString());
const getIdStr = () => (child ? idStr : chalk_1.default.gray('main'));
const getDateStr = () => `[${chalk_1.default.gray(new Date().toLocaleTimeString())}]`;
const getMessagePrefix = () => `${getDateStr()} ${getIdStr()}:`;
const makeMessage = (...args) => args.map(a => a.toString()).join(' ').split('\n').map(s => `${getMessagePrefix()} ${s}`).join('\n');
exports.setSilent = (isSilent) => silent = isSilent;
exports.setChild = (isChild) => child = isChild;
exports.log = (...args) => silent ? undefined : console.log(makeMessage(...args));
exports.warn = (...args) => silent ? undefined : console.warn(makeMessage(...args));
exports.error = (...args) => silent ? undefined : console.error(makeMessage(...args));
exports.inspect = (obj, depth = Infinity) => silent ? undefined : console.log(getMessagePrefix() + '\n' + util.inspect(obj, { depth, colors: true }));
