import * as cheerio from 'cheerio';
import { propEq } from 'ramda';
import programUrls from '../../../../../config/program_urls.json';
import config from '../../../../../config/config.json';
import { Category, Channel } from '../../../interfaces';
import { Http } from '../../http';
import { DB } from '../../db';
import { Context } from '../../inject';
import { getUrlPath } from './';
const http = new Http();

const db: DB = Context.getContext().get<DB>(DB);

export async function storeChannelList() {
  try {
    const channels = await getChannelList();
    const filteredChannels = channels.filter(
      (channel) => !config.digionline.removeChannels.includes(parseInt(channel.id)),
    );
    db.set('channels', filteredChannels);
    console.log('Successful Channels generation!');
  } catch (e) {
    console.error(`Channels generation failed! (${e.message})`);
  }
}

export function getLogoFilename(url: string): string {
  return url.split('/')[url.split('/').length - 1].split('#')[0];
}

async function getChannelList(): Promise<Channel[]> {
  const response = await http.get('https://digionline.hu/csatornak');
  const $ = cheerio.load(response);
  const categories = parseCategories($);
  return parseChannels(categories, $);
}

function parseCategories($: CheerioStatic): Category[] {
  return $('#categories option[value!="0"]')
    .toArray()
    .map((option) => ({
      id: $(option).val(),
      name: $(option).text(),
    }));
}

function parseChannels(categories: Category[], $: CheerioStatic): Channel[] {
  return $('.channel')
    .toArray()
    .map((channel) => {
      const $channel = $(channel);
      const id = $channel.find('.favorite').attr('data-id');
      const name = $channel.find('.channels__name').text().trim();
      return {
        name,
        logoUrl: $channel.find('img').attr('src'),
        id,
        category: categories.find(propEq('id', $(channel).attr('data-category'))),
        url: getChannelUrl(id),
        programUrl: getProgramUrl(id, name),
      };
    });
}

function getProgramUrl(id, name): string {
  const program = programUrls.find((program) => program.name === name || program.id === id);
  if (program) return programUrls.find((program) => program.name === name || program.id === id).programUrl;
}

function getChannelUrl(id: string) {
  return `${getUrlPath(true)}/channel/${id}`;
}
