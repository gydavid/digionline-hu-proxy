import express from 'express';
const basicAuth = require('express-basic-auth');
import config from '../../config/config.json';
import { DB } from '../db';
import { generatePlaylist } from '../digionline/libs';
import { getPlaylist } from '../digionline/libs/player';
import { Inject } from '../inject';

const app = express();

export class Web {
  @Inject(DB) private _db: DB;
  constructor() {
    this._create();
  }

  private async _create() {
    if (config.web.auth.enabled) {
      app.use(
        basicAuth({
          users: { [config.web.auth.user]: config.web.auth.password },
          challenge: true,
          realm: 'TV helper',
        }),
      );
    }

    app.get('/epg/:device_id*?', (_req, res) => {
      console.log('get EPG');
      res.sendFile('data/epg.xml', { root: process.cwd() });
    });

    app.get('/channels/:device_id*?', async (req, res) => {
      let deviceId = req.params.device_id ? parseInt(req.params.device_id.split(/[.\-_]/)[0]) : 0;
      if (deviceId > 2) deviceId = 0;
      const playslist = await generatePlaylist(this._db.get('channels'), deviceId);
      res.send(playslist);
    });

    app.get('/channel/:channel_id/:device_id?/:quality*?', async (req, res) => {
      if (req.params.channel_id) {
        try {
          let deviceId = req.params.device_id ? parseInt(req.params.device_id.split(/[.\-_]/)[0]) : 0;
          if (deviceId > 2) deviceId = 0;
          const stream = await getPlaylist(
            this._db.find('channels', { id: req.params.channel_id }),
            req.params.quality || 'hq',
            deviceId,
          );
          res.send(stream);
        } catch {
          res.send('ERROR');
        }
      }
    });

    app.get('*', (_req, res) => res.send('Yay! :('));

    app.listen(config.web.innerPort, () =>
      console.log(`Listening at ${config.web.ssl ? 'https' : 'http'}://${config.web.domain}:${config.web.outerPort}`),
    );
  }
}
