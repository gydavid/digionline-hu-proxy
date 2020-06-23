import * as cheerio from 'cheerio';
const got = require('got');
const addHours = require('date-fns/addHours');
const isEqual = require('date-fns/isEqual');
import { slug, promiseSequence } from '../../../lib';
import { Channel, ParsedChannel, Program } from '../../../interfaces';

export function getAllPrograms(channels: Channel[], bar?): Promise<ParsedChannel[]> {
  return promiseSequence(
    channels.map((channel) => () =>
      getPrograms(channel).then((programs) => {
        if (bar) bar.tick();
        return programs;
      }),
    ),
  );
}

export async function getPrograms(channel: Channel, attempt = 0): Promise<ParsedChannel> {
  const response = await got(channel.programUrl, {
    timeout: 1000 * 30,
    retry: 3,
  });

  try {
    const programList: Program[] = [];
    const $ = cheerio.load(response.body);

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
                id: slug(channel.name),
                title: $(program).find('[itemprop="name"] a').text(),
                subtitle: $(program).find('[itemprop="description"]').text(),
                desc: $(program).find('.smartpe_progentrylong').text(),
              });
            }
          });
      }
    });

    if (programList.length === 0) {
      throw new Error('parsing problem');
    }

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
    return { ...channel, programs };
  } catch (e) {
    if (attempt < 3) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(getPrograms(channel, attempt + 1));
        }, 1000);
      });
    }
    throw e;
  }
}
