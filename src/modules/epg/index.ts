import { generateEpg } from './libs';
import { DB } from '../db';
import programUrls from '../../config/program_urls.json';
import { Channel } from '../../interfaces';
import { Inject } from '../inject';

export class Epg {
  @Inject(DB) private _db: DB;

  constructor() {
    this.epg = this.epg.bind(this);
  }

  async epg() {
    const channels = this._db.get('channels') as Channel[];
    await generateEpg(channels.length ? channels : (programUrls as Channel[]));
  }
}
