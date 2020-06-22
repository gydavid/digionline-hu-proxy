import { getChannelList } from './libs';
import { DB } from '../db';
import { Inject } from '../inject';

export class DigiOnline {
  @Inject(DB) private _db: DB;

  constructor() {
    this.channels = this.channels.bind(this);
    this._db.defaults({ channels: [] });
  }

  async channels() {
    const channels = await getChannelList();
    this._db.set('channels', channels);
    console.log('Successful Channels generation!');
  }
}
