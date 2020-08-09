import { storeChannelList } from './libs';
import { DB } from '../db';
import { Inject } from '../inject';
import config from '../../../../config/config.json';

export class DigiOnline {
  @Inject(DB) private _db: DB;

  constructor() {
    this.channels = this.channels.bind(this);
    this._db.defaults({ channels: [], session: {} });
    this._db.set(`session`, {});
  }

  async channels() {
    await storeChannelList();
  }
}
