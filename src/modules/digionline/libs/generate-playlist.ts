import { slug } from '../../../lib';
import { Channel } from '../../../interfaces';

export async function generatePlaylist(channels: Channel[], deviceId: number, quality: string): Promise<string> {
  return (
    `#EXTM3U tvg-shift="${(new Date().getTimezoneOffset() / 60) * -1}"\n` +
    channels
      .map((channel) => {
        return `#EXTINF:-${channel.id} tvg-id="${slug(channel.name)}" tvg-name="${channel.name}" tvg-logo="${
          channel.logoUrl
        }" group-title="${channel.category.name}", ${channel.name}\n${channel.url}/${deviceId}/${quality}`;
      })
      .join('\n')
  );
}
