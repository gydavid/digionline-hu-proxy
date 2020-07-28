import config from '../../../../config/config.json';
import { promiseSequence } from '../../lib/index';

type LoopFn = () => Promise<void>;
export class Loop {
  constructor(...args: LoopFn[]) {
    this._loop = this._loop.bind(this);
    this._loop(args);
  }

  async _loop(loops) {
    await promiseSequence(loops);
    setTimeout(() => this._loop(loops), 1000 * 60 * 60 * config.refresh_interval);
  }
}
