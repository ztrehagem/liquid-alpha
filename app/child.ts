import { inspect } from 'util';
import { Term, FutureMessage } from './clterm';

process.on('message', async ({ term: obj }: FutureMessage) => {
  try {
    // console.log('<recv>', inspect(obj, { depth: Infinity, colors: true }));
    
    const term = Term.fromObject(obj);
    // console.log('<future>', inspect(term, { depth: Infinity, colors: true }));
    const evaluated = await term.evaluate();
    const message: FutureMessage = {
      term: evaluated,
    };
    process.send(message, () => process.exit());    
  } catch (error) {
    console.error('<!> error in future process');
    console.error(error);
    const message: FutureMessage = {
      term: null,
      error: error.message,
    };
    process.send(message, () => process.exit(1));
  }
});