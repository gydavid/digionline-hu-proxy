import { getChannelList } from './libs';
import { Inject } from 'inject-ts';
import { DB } from '../db';

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
