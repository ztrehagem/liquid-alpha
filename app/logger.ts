import * as util from 'util';
import chalk from 'chalk';

const idColor = (() => {
  switch (process.pid % 5) {
    case 0: return chalk.cyan;
    case 1: return chalk.magenta;
    case 2: return chalk.green;
    case 3: return chalk.yellow;
    case 4: return chalk.redBright;
  }
})();

let child = false;

const idStr = idColor(process.pid.toString());
const getIdStr = () => (child ? idStr : chalk.gray('main'));
const getDateStr = () => `[${chalk.gray(new Date().toLocaleTimeString())}]`;
const getMessagePrefix = () => `${getDateStr()} ${getIdStr()}:`;
const makeMessage = (...args: any[]) => args.map(a => a.toString()).join(' ').split('\n').map(s => `${getMessagePrefix()} ${s}`).join('\n');

export const setChild = (isChild: boolean) => child = isChild;
export const log = (...args: any[]) => console.log(makeMessage(...args));
export const warn = (...args: any[]) => console.warn(makeMessage(...args));
export const error = (...args: any[]) => console.error(makeMessage(...args));
export const inspect = (obj: any, depth: number = Infinity) => console.log(getMessagePrefix() + '\n' + util.inspect(obj, { depth, colors: true }));