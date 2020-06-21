import { Channel, ParsedChannel, Program } from './interfaces';
import * as cheerio from 'cheerio';
const got = require('got');
import { addHours, isEqual } from 'date-fns';

export function getAllPrograms(channels: Channel[], bar?): Promise<ParsedChannel[]> {
  return Promise.all(channels.map((channel) => getPrograms(channel, bar)));
}

export async function getPrograms(channel: Channel, bar?): Promise<ParsedChannel> {
  const response = await got(channel.url, {
    timeout: 1000 * 30,
    retry: 3,
    hooks: {
      beforeRetry: [
        (opt) => {
          console.log('[Retry]', opt.href);
        },
      ],
    },
  });

  const programList: Program[] = [];
  const $ = cheerio.load(response.body, { decodeEntities: true });

  $('section').each((_, section) => {
    let ignore = $(section).find('[class="rotated-text rotated-to-be-seen_internal"]').length > 0;

    if (!ignore) {
      $(section)
        .find('[itemtype="https://schema.org/BroadcastEvent"]')
        .each((_, program) => {
          const startDate = new Date($(program).find('[itemprop="startDate"]').attr('content'));

          if (!programList.find((program) => isEqual(program.startDate, startDate))) {
            programList.push({
              startDate,
              endDate: addHours(startDate, 1),
              id: channel.slug,
              title: $(program).find('[itemprop="name"] a').text(),
              subtitle: $(program).find('[itemprop="description"]').text(),
              desc: $(program).find('.smartpe_progentrylong').text(),
            });
          }
        });
    }
  });

  programList.sort(function (a, b) {
    const aData = new Date(a.startDate);
    const bDate = new Date(b.startDate);
    return aData < bDate ? -1 : aData > bDate ? 1 : 0;
  });

  const programs = programList.map((program, i) => {
    if (!programList[i + 1]) return program;
    return {
      ...program,
      endDate: programList[i + 1].startDate,
    };
  });

  if (bar) bar.tick();

  return { ...channel, programs };
}
