"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const clterm_1 = require("./clterm");
process.on('message', async ({ term: obj }) => {
    try {
        console.log('<recv>', util_1.inspect(obj, { depth: Infinity, colors: true }));
        const term = clterm_1.Term.fromObject(obj);
        console.log('<future>', util_1.inspect(term, { depth: Infinity, colors: true }));
        const evaluated = await term.evaluate();
        const message = {
            term: evaluated,
        };
        process.send(message, () => process.exit());
    }
    catch (error) {
        console.error('<!> error in future process');
        console.error(error);
        const message = {
            term: null,
            error: error.message,
        };
        process.send(message, () => process.exit(1));
    }
});
