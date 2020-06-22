import config from '../../config/config.json';

type LoopFn = () => Promise<void>;
export class Loop {
  constructor(...args: LoopFn[]) {
    this._loop = this._loop.bind(this);
    this._loop(args);
  }

  async _loop(loops) {
    await loops.reduce(async (previousPromise, nextAsyncFunction) => {
      await previousPromise;
      await nextAsyncFunction();
    }, Promise.resolve());
    setTimeout(this._loop, 1000 * 60 * 60 * config.refresh_interval);
  }
}
