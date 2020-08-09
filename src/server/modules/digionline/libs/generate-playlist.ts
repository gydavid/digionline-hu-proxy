import { slug } from '../../../lib';
import { Channel } from '../../../interfaces';
import extraChannels from '../../../../../config/extra_channels.json';
import { sortBy, compose, toLower, prop, assoc } from 'ramda';
import config from '../../../../../config/config.json';
import { getUrlPath } from './';
import { Context } from '../../inject';
import { DB } from '../../db';

const db: DB = Context.getContext().get<DB>(DB);

const sortByNameCaseInsensitive = sortBy(compose(toLower, prop('name')));

export function generatePlaylist(channels: Channel[], deviceId: number, quality: string): string {
  const mergedChannels = getMergedChannels(channels, deviceId, quality);
  return (
    `#EXTM3U tvg-shift="${(new Date().getTimezoneOffset() / 60) * -1}"\n` +
    mergedChannels
      .map((channel) => {
        const group = config.groups ? ` group-title="${channel.category.name}"` : '';
        return `#EXTINF:${channel.id} tvg-id="${slug(channel.name)}" tvg-name="${channel.name}" tvg-logo="${
          channel.logo
        }"${group}, ${channel.name}\n${channel.url}`;
      })
      .join('\n')
  );
}

export function getMergedChannels(channels: Channel[], deviceId: number, quality: string): Channel[] {
  const mergedChannels = sortByNameCaseInsensitive([...channels, ...extraChannels.map(assoc('extra', true))]);
  return mergedChannels.map((channel) => {
    const url = channel['extra'] ? channel.url : `${channel.url}/${deviceId}/${quality}/stream.m3u8`;
    return { ...channel, url, logo: `${getUrlPath(false)}/logo/${channel.id}` };
  });
}

export function getChannel(channelId: string) {
  let channel;
  channel = db.find('channels', { id: channelId });
  if (!channel) {
    channel = extraChannels.find((channel) => channel.id === channelId);
  }
  return channel;
}
