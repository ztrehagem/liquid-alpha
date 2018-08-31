"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const clterm_1 = require("./clterm");
logger_1.setChild(true);
process.on('message', async ({ term: obj }) => {
    try {
        const term = clterm_1.fromObject(obj);
        const evaluated = await term.evaluate();
        const message = {
            term: evaluated,
        };
        process.send(message, () => process.exit());
    }
    catch (error) {
        error('<!> error in future process');
        error(error);
        const message = {
            term: null,
            error: error.message,
        };
        process.send(message, () => process.exit(1));
    }
});
