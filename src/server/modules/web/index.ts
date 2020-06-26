import express from 'express';
const basicAuth = require('express-basic-auth');
import config from '../../../../config/config.json';
import { DB } from '../db';
import { generatePlaylist, getChannels } from '../digionline/libs';
import { getPlaylist, getDevice } from '../digionline/libs/player';
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

    app.get('/epg/:device_id*?', (req, res) => {
      let deviceId = req.params.device_id ? parseInt(req.params.device_id.split(/[.\-_]/)[0]) : 0;
      if (deviceId > 2) deviceId = 0;
      console.log(`#${getDevice(deviceId).device_name}# Get EPG`);
      res.sendFile('data/epg.xml', { root: process.cwd() });
    });

    app.get('/channels/:device_id?/:quality*?', async (req, res) => {
      let deviceId = req.params.device_id ? parseInt(req.params.device_id.split(/[.\-_]/)[0]) : 0;
      if (deviceId > 2) deviceId = 0;
      const playslist = generatePlaylist(this._db.get('channels'), deviceId, req.params.quality || 'hq');
      res.send(playslist);
    });

    app.get('/channels.json/:device_id?/:quality*?', async (req, res) => {
      let deviceId = req.params.device_id ? parseInt(req.params.device_id.split(/[.\-_]/)[0]) : 0;
      if (deviceId > 2) deviceId = 0;
      const playslist = getChannels(this._db.get('channels'), deviceId, req.params.quality || 'hq');
      res.send(playslist);
    });

    app.get('/channel/:channel_id/:device_id?/:quality*?', async (req, res) => {
      if (req.headers['icy-metadata']) {
        res.send('');
        return;
      }
      if (req.params.channel_id) {
        let deviceId = req.params.device_id ? parseInt(req.params.device_id.split(/[.\-_]/)[0]) : 0;
        if (deviceId > 2) deviceId = 0;
        try {
          const stream = await getPlaylist(
            this._db.find('channels', { id: req.params.channel_id }),
            req.params.quality || 'hq',
            deviceId,
          );
          res.send(stream);
        } catch (e) {
          console.log(`#${getDevice(deviceId).device_name}# ${e.message}`);
          res.send('ERROR');
        }
      }
    });

    app.get('/', function (_req, res) {
      res.sendFile(process.cwd() + '/dist/client/index.html');
    });

    app.use(express.static(process.cwd() + '/dist/client'));

    app.listen(config.web.innerPort, () =>
      console.log(`Listening at ${config.web.ssl ? 'https' : 'http'}://${config.web.domain}:${config.web.outerPort}`),
    );
  }
}
