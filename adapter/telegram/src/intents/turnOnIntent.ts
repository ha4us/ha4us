import {
  StatefulObjectsService,
  ObjectService,
  StateService,
} from '@ha4us/adapter'
import { Ha4usLogger, Ha4usObject } from '@ha4us/core'
import {
  IIntentParams,
  IIntentRequest,
  IIntentResponse,
  AbstractIntent,
} from '.'

import { Observable, from } from 'rxjs'
import { map, tap, toArray } from 'rxjs/operators'

const MSG_SUCCESS = `Ich habe {{response.length}} {{slots.actor}}\
{{#defined slots.room}} in {{slots.room}}{{else}} im System{{/defined}} bedient!
{{#each response}}{{this.label}}{{#unless @last}},{{/unless}}{{/each}}`

export default class ShowIntent extends AbstractIntent {
  constructor(
    protected $log: Ha4usLogger,
    protected $objects: ObjectService,
    protected $states: StateService
  ) {
    super()
  }

  public async handleRequest(req: IIntentRequest, res: IIntentResponse) {
    this.$log.debug('Received intent', req)
    const tags: string[] = []

    if (req.slots.room) {
      tags.push('@' + req.slots.room)
    }
    let targetVal: any
    let typeTargetVal: string
    try {
      targetVal = JSON.parse(req.slots.action)
    } catch (e) {
      targetVal = req.slots.action
    }
    typeTargetVal = typeof targetVal

    // first try to read direct by name
    let result = await this.$objects.get({ name: req.slots.actor, tags })

    if (result.length === 0) {
      tags.push('#' + req.slots.actor)
      result = await this.$objects.get({ tags })
    }

    res.data = result
    res.text = JSON.stringify(result)

    return from(result)
      .pipe(
        map((object: Ha4usObject) => {
          let val: any
          const topic = object.topic
          if (typeTargetVal === object.type) {
            val = targetVal
          } else if (targetVal === 'an' && object.type === 'boolean') {
            val = true
          } else if (targetVal === 'aus' && object.type === 'boolean') {
            val = false
          } else if (targetVal === 'an' && object.type === 'number') {
            val = 100
          } else if (targetVal === 'aus' && object.type === 'number') {
            val = 0
          }
          this.$log.debug('Setting %s to', topic, val)
          this.$states.set(topic, val)
          return { topic, val, label: object.label || object.topic }
        }),
        toArray(),
        tap(setResults => {
          res.text = this.createText(MSG_SUCCESS, {
            response: setResults,
            slots: req.slots,
          })
        })
      )
      .toPromise()
  }
}
