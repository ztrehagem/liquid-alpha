"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clterm_1 = require("./clterm");
process.on('message', async ({ term: obj }) => {
    try {
        const term = clterm_1.Term.fromObject(obj);
        console.log('<future>', term);
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
