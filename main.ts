import channels from './channels/channels.json';
import { generateEpg } from './lib/generate-epg';

epgLoop();

async function epgLoop() {
  await generateEpg(channels);
  setTimeout(epgLoop, 30000);
}
