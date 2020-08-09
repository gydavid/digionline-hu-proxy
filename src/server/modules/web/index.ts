import express from 'express';
const basicAuth = require('express-basic-auth');
import config from '../../../../config/config.json';
import { DB } from '../db';
import { generatePlaylist, getMergedChannels, getChannel } from '../digionline/libs';
import { getPlaylist, getDevice } from '../digionline/libs/player';
import { Inject } from '../inject';
import { Http } from '../http';
const fs = require('fs');

const app = express();
const http = new Http();

export class Web {
  @Inject(DB) private _db: DB;
  constructor() {
    this._create();
  }

  private async _create() {
    let auth = (_req, _res, next) => next();
    if (config.web.auth.enabled) {
      auth = basicAuth({
        users: { [config.web.auth.user]: config.web.auth.password },
        challenge: true,
        realm: 'TV helper',
      });
    }

    app.get('/epg/:device_id*?', auth, (req, res) => {
      let deviceId = req.params.device_id ? parseInt(req.params.device_id.split(/[.\-_]/)[0]) : 0;
      if (deviceId > 2) deviceId = 0;
      console.log(`#${getDevice(deviceId).device_name}# Get EPG`);
      res.sendFile('data/epg.xml', { root: process.cwd() });
    });

    app.get('/channels/:device_id?/:quality*?', auth, async (req, res) => {
      let deviceId = req.params.device_id ? parseInt(req.params.device_id.split(/[.\-_]/)[0]) : 0;
      if (deviceId > 2) deviceId = 0;
      const playslist = generatePlaylist(this._db.get('channels'), deviceId, req.params.quality || 'hq');
      res.send(playslist);
    });

    app.get('/channels.json/:device_id?/:quality*?', auth, async (req, res) => {
      let deviceId = req.params.device_id ? parseInt(req.params.device_id.split(/[.\-_]/)[0]) : 0;
      if (deviceId > 2) deviceId = 0;
      const playslist = getMergedChannels(this._db.get('channels'), deviceId, req.params.quality || 'hq');
      res.send(playslist);
    });

    app.get('/channel/:channel_id/:device_id?/:quality*?', auth, async (req, res) => {
      if (req.headers['icy-metadata'] || !req.params.channel_id) {
        res.send('');
        return;
      }
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
    });

    app.get('/logo/:channel_id.:ext?', async (req, res) => {
      if (!req.params.channel_id) {
        res.send('');
        return;
      }

      const logoFolder = process.cwd() + '/data/logo';
      if (!fs.existsSync(logoFolder)) {
        fs.mkdirSync(logoFolder);
      }
      const channel = getChannel(req.params.channel_id);
      if (!channel) {
        res.send('');
        return;
      }

      const extension = channel.logoUrl.split('.')[channel.logoUrl.split('.').length - 1];
      if (!fs.existsSync(`${logoFolder}/${channel.id}.${extension}`)) {
        await http.download(channel.logoUrl, `${logoFolder}/${channel.id}.${extension}`);
      }

      res.sendFile(`${logoFolder}/${channel.id}.${extension}`);
    });

    app.get('/', auth, function (_req, res) {
      res.sendFile(process.cwd() + '/dist/client/index.html');
    });

    app.use(express.static(process.cwd() + '/dist/client'));

    app.listen(config.web.innerPort, () =>
      console.log(`Listening at ${config.web.ssl ? 'https' : 'http'}://${config.web.domain}:${config.web.outerPort}`),
    );
  }
}
