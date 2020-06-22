import { Channel } from '../../../interfaces';
import * as cheerio from 'cheerio';
import { Http } from '../../http';
import config from '../../../config/config.json';
const differenceInSeconds = require('date-fns/differenceInSeconds');

const http: Http[] = config.digionline.users.map(() => new Http());
const lastChannel = {};
let lastHello = [];

export async function getPlaylist(channel: Channel, quality = 'hq', deviceId, afterLogin = false) {
  if (lastChannel[deviceId] && lastChannel[deviceId].channel.id === channel.id) {
    const refresh = await hello(deviceId, channel);
    if (!refresh) {
      await login(deviceId);
      return getPlaylist(channel, quality, deviceId, true);
    }
    console.log(`#${getDevice(deviceId).device_name}# Continues channel: ${channel.name}`);
    const stream = await getStream(lastChannel[deviceId].playlists, quality, deviceId);
    return stream;
  }
  hello(deviceId, channel);
  console.log(`#${getDevice(deviceId).device_name}# Get channel: ${channel.name}`);

  const response = await http[deviceId].get(`https://digionline.hu/player/${channel.id}`);

  const urlMatch = response.match(/https:\/\/online.digi.hu(.*?).m3u8/g);

  if (!urlMatch) {
    if (!afterLogin) {
      await login(deviceId);
      return getPlaylist(channel, quality, deviceId, true);
    } else {
      throw new Error('Missing playlist url');
    }
  }
  const playlists = await http[deviceId].get(urlMatch[0]);
  lastChannel[deviceId] = { channel, playlists };
  const stream = await getStream(playlists, quality, deviceId);
  return stream;
}

async function hello(deviceId: number, channel: Channel) {
  if (lastHello[deviceId] && differenceInSeconds(new Date(), lastHello[deviceId]) < 30) return true;
  const response = await http[deviceId].get(`https://digionline.hu/refresh?id=${channel.id}`, {
    Referer: `https://digionline.hu/player/${channel.id}`,
    'X-Requested-With': 'XMLHttpRequest',
  });
  lastHello[deviceId] = new Date();
  return !JSON.parse(response).error;
}

async function getStream(playlists, quality, deviceId) {
  let streamUrl = playlists.trim().match(new RegExp(`https:(.*q=${quality}.*)`, 'g'));
  if (!streamUrl) streamUrl = playlists.trim().match(new RegExp(`https:(.*q=.*)$`, 'g'));
  const timestamp = Math.floor(Date.now() / 1000);
  let url = streamUrl[0].split('&_t=')[0] + `&_t=${timestamp}`;
  return await http[deviceId].get(url);
}

async function login(deviceId: number) {
  console.log(`#${getDevice(deviceId).device_name}# Login to DigiOnline...`);
  const response = await http[deviceId].get('https://digionline.hu/login');

  const $ = cheerio.load(response);
  const token = $('[name="_token"]').val();

  if (!token) {
    throw new Error('missing token');
  }

  await http[deviceId].post('https://digionline.hu/login', {
    _token: token,
    accept: '1',
    email: getDevice(deviceId).email,
    password: getDevice(deviceId).password,
  });

  if (isLoggedIn(deviceId)) {
    delete lastChannel[deviceId];
    console.log(`#${getDevice(deviceId).device_name}# Login Success!`);
  } else {
    throw new Error('Login Failed :(');
  }
}

async function isLoggedIn(deviceId: number) {
  const response = await http[deviceId].get('https://digionline.hu/');

  return response.indexOf('"in-user"') > -1 ? true : false;
}

export function getDevice(devieId: number) {
  return config.digionline.users[devieId];
}
