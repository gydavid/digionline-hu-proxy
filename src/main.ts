import { Epg } from './modules/epg';
import { Web } from './modules/web';
import { DigiOnline } from './modules/digionline';
import { Loop } from './modules/loop';

(async () => {
  new Web();
  new Loop(new DigiOnline().channels, new Epg().epg);
})();
