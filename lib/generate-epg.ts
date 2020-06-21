import { Channel, ParsedChannel } from './interfaces';
import { getAllPrograms } from './musortv-parser';
import { safeXML } from './html-encoder';
import { flatten } from 'ramda';
import { format, subHours } from 'date-fns';
const fs = require('fs');
const ProgressBar = require('progress');

export async function generateEpg(rawChannels: Channel[]) {
  console.log('---------------------------');
  console.log('Start Program parsing!');
  console.log(' ');
  const bar = new ProgressBar(':bar :current/:total channel loaded...', {
    total: rawChannels.length,
  });
  const channels = await getAllPrograms(rawChannels, bar);
  const channelsXml = channels.map(getChannelXml);
  const programsXml = flatten(channels.map(getProgramsXml));
  writeXml(channelsXml, programsXml);
  console.log(' ');
  console.log('Successful EPG generation!');
  console.log(' ');
  fs.writeFileSync('.last_epg_generation', new Date())
}

function getChannelXml(channel: Channel): string {
  return `<channel id="${safeXML(channel.slug)}"><display-name lang="hu">${safeXML(
    channel.name,
  )}</display-name></channel>`;
}

function getProgramsXml(channel: ParsedChannel): string[] {
  return channel.programs.map((program) => {
    return `<programme start="${getXMLDate(program.startDate)}" stop="${getXMLDate(
      program.endDate,
    )}" channel="${safeXML(program.id)}"><title lang="hu">${safeXML(
      program.title,
    )}</title><sub-title lang="hu">${safeXML(program.subtitle)}</sub-title><desc lang="hu">${safeXML(
      program.desc,
    )}</desc></programme>`;
  });
}

function getXMLDate(date: Date): string {
  const offset = (date.getTimezoneOffset() / 60) * -1;
  return format(subHours(date, offset), `yyyyMMddHHmmss +0${offset}00`);
}

function writeXml(channelsXml: string[], programsXml: string[]): void {
  const xml = `<?xml version="1.0" encoding="utf-8" ?>\n<tv>\n${channelsXml.join('\n')}\n${programsXml.join(
    '\n',
  )}</tv>`;
  fs.writeFileSync('./epg.xml', xml);
}
