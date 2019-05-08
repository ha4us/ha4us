import {
  IHa4usLogger,
  IHa4usArguments,
  StatesService,
  YamlService,
  MapService,
  DBMediaService, IHa4usMedia, UserService, StatefulObjects
} from 'ha4us/adapter/index'

import {IIntentParams, IIntentRequest, IIntentResponse, AbstractIntent} from '.';



const MSG_SUCCESS = `Ok! {{response.length}} {{slots.function}}\
{{#defined slots.room}} in {{slots.room}}{{/defined}} gefunden!
{{#each response}}{{default this.object.name this.object.topic}} \
ist {{default (format this.state.val this.object) '_unbekannt_'}}
{{/each}}`;
const MSG_NOTFOUND = `Entschuldigung! Ich habe kein '{{slots.function}}'\
{{#defined slots.room}} in {{slots.room}}{{else}} insgesamt{{/defined}} gefunden!`;


export default class ShowIntent extends AbstractIntent {
  protected $os: StatefulObjects;
  protected $log: IHa4usLogger;
  constructor ($log: IHa4usLogger, $os: StatefulObjects, $maps: MapService) {
    super($maps);
    this.$log = $log;
    this.$os = $os;
  }

  public async handleRequest (req: IIntentRequest, res: IIntentResponse) {


    const tags: string[] = [];

    if (req.slots.room) {
      tags.push ('@' + req.slots.room);
    }

    // first try to read direct by name
    let result = await this.$os.get({name: req.slots.function, tags: tags});

    // if nothing found by name, try with tagged objects
    if (result.length === 0) {
      tags.push('#' + req.slots.function);
      result = await this.$os.get({tags: tags});
    }

    if (result.length === 0) {
      res.text = this.createText(MSG_NOTFOUND, {slots: req.slots});
    } else {
      res.text = this.createText(MSG_SUCCESS, {response: result, slots: req.slots});
    }
    res.data = result;

}

}
