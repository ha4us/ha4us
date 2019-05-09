import {
  IHa4usLogger,
  IHa4usArguments,
  StatesService,
  YamlService,
  MapService,
  DBMediaService, IHa4usMedia, UserService, StatefulObjects, ObjectService
} from 'ha4us/adapter/index'

import {IHa4usObject} from 'ha4us/core';

import {IIntentParams, IIntentRequest, IIntentResponse, AbstractIntent} from '.';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/do';


const MSG_SUCCESS = `Ich habe {{response.length}} {{slots.actor}}\
{{#defined slots.room}} in {{slots.room}}{{else}} im System{{/defined}} bedient!
{{#each response}}{{this.label}}{{#unless @last}},{{/unless}}{{/each}}`;

export default class ShowIntent extends AbstractIntent {
  protected $objects: ObjectService;
  protected $states: StatesService;
  protected $log: IHa4usLogger;
  constructor ($log: IHa4usLogger, $objects: ObjectService, $states: StatesService, $maps: MapService) {
    super($maps);
    this.$log = $log;
    this.$objects = $objects;
    this.$states = $states;
  }

  public async handleRequest (req: IIntentRequest, res: IIntentResponse) {

    this.$log.debug ('Received intent', req);
    const tags: string[] = [];

    if (req.slots.room) {
      tags.push ('@' + req.slots.room);
    }
    let targetVal: any;
    let typeTargetVal: string;
    try {
      targetVal = JSON.parse(req.slots.action);
    } catch (e) {
      targetVal = req.slots.action;
    }
    typeTargetVal = typeof targetVal;



    // first try to read direct by name
    let result = await this.$objects.get({name: req.slots.actor, tags: tags});

    if (result.length === 0) {
      tags.push('#' + req.slots.actor);
      result = await this.$objects.get({tags: tags});
    }

    res.data = result;
    res.text = (JSON.stringify(result));


    return Observable.from(result)
      .map((object: IHa4usObject) => {
        let val: any;
        const topic = object.topic;
        if (typeTargetVal === object.type) {
          val = targetVal;
        } else if (targetVal === 'an' && object.type === 'boolean') {
          val = true;
        } else if (targetVal === 'aus' && object.type === 'boolean') {
          val = false;
        } else if (targetVal === 'an' && object.type === 'number') {
          val = 100;
        } else if (targetVal === 'aus' && object.type === 'number') {
          val = 0;
        }
        this.$log.debug ('Setting %s to', topic, val);
        this.$states.set(topic, val);
        return {topic, val, label: object.name || object.topic};
      })
      .toArray()
      .do((setResults) => {
        res.text = this.createText(MSG_SUCCESS, {response: setResults, slots: req.slots});
      })
      .toPromise();


}

}
