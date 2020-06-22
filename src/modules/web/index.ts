import express from 'express';
const basicAuth = require('express-basic-auth');
import config from '../../../config/config.json';
import { DB } from '../db/index.js';
import { Inject } from 'inject-ts';
import { generatePlaylist } from '../digionline/libs';

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
      // const deviceId = req.params.device_id ? req.params.device_id.split(/[.\-_]/)[0] : null;
      res.sendFile('data/epg.xml', { root: process.cwd() });
    });

    app.get('/channels/:device_id*?', async (_req, res) => {
      // const deviceId = req.params.device_id ? req.params.device_id.split(/[.\-_]/)[0] : null;
      const playslist = await generatePlaylist(this._db.get('channels'));
      res.header({ 'Content-Type': 'application/x-mpegURL' }).send(playslist);
    });

    app.get('/channel/:channel_id/:device_id*?', async (req, res) => {
      // const deviceId = req.params.device_id ? req.params.device_id.split(/[.\-_]/)[0] : null;
      res.send(req.params.channel_id);
    });

    app.get('*', (_req, res) => res.send('Yay! :('));

    app.listen(config.web.port, () => console.log(`Listening at http://${config.web.domain}:${config.web.port}`));
  }
}
