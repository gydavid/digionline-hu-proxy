import { slug } from '../../../lib';
import { Channel } from '../../../interfaces';
import extraChannels from '../../../../config/extra_channels.json';
import { sortBy, compose, toLower, prop, assoc } from 'ramda';

const sortByNameCaseInsensitive = sortBy(compose(toLower, prop('name')));

export async function generatePlaylist(channels: Channel[], deviceId: number, quality: string): Promise<string> {
  const mergedChannels = sortByNameCaseInsensitive([...channels, ...extraChannels.map(assoc('extra', true))]);
  return (
    `#EXTM3U tvg-shift="${(new Date().getTimezoneOffset() / 60) * -1}"\n` +
    mergedChannels
      .map((channel) => {
        const url = channel['extra'] ? channel.url : `${channel.url}/${deviceId}/${quality}`;
        return `#EXTINF:${channel.id} tvg-id="${slug(channel.name)}" tvg-name="${channel.name}" tvg-logo="${
          channel.logoUrl
        }" group-title="${channel.category.name}", ${channel.name}\n${url}`;
      })
      .join('\n')
  );
}
