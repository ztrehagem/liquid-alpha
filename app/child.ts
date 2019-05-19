import { setChild, setSilent, log, error, inspect } from './logger';
import { fromObject, ProcessMessage } from './clterm';

setChild(true);
setSilent(!!process.env.SILENT);

process.on('message', async ({ term: obj }: ProcessMessage) => {
  try {
    // log('<recv>', inspect(obj));
    
    const term = fromObject(obj);
    // log('<future>', inspect(term));
    const evaluated = await term.evaluate();
    const message: ProcessMessage = {
      term: evaluated,
    };
    process.send(message, () => process.exit());    
  } catch (error) {
    error('<!> error in future process');
    error(error);
    const message: ProcessMessage = {
      term: null,
      error: error.message,
    };
    process.send(message, () => process.exit(1));
  }
});