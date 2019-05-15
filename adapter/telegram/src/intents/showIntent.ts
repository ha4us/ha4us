import { StatefulObjectsService } from '@ha4us/adapter'

import { Ha4usLogger } from '@ha4us/core'

import {
  IIntentParams,
  IIntentRequest,
  IIntentResponse,
  AbstractIntent,
} from '.'

const MSG_SUCCESS = `Ok! {{response.length}} {{slots.function}}\
{{#defined slots.room}} in {{slots.room}}{{/defined}} gefunden!
{{#each response}}{{default this.object.name this.object.topic}} \
ist {{default (format this.state.val this.object) '_unbekannt_'}}
{{/each}}`
const MSG_NOTFOUND = `Entschuldigung! Ich habe kein '{{slots.function}}'\
{{#defined slots.room}} in {{slots.room}}{{else}} insgesamt{{/defined}} gefunden!`

export class ShowIntent extends AbstractIntent {
  constructor(
    protected $log: Ha4usLogger,
    protected $os: StatefulObjectsService
  ) {
    super()
  }

  public async handleRequest(req: IIntentRequest, res: IIntentResponse) {
    const tags: string[] = []

    if (req.slots.room) {
      tags.push('@' + req.slots.room)
    }

    // first try to read direct by name
    let result = await this.$os.get({ name: req.slots.function, tags })

    // if nothing found by name, try with tagged objects
    if (result.length === 0) {
      tags.push('#' + req.slots.function)
      result = await this.$os.get({ tags })
    }

    if (result.length === 0) {
      res.text = this.createText(MSG_NOTFOUND, { slots: req.slots })
    } else {
      res.text = this.createText(MSG_SUCCESS, {
        response: result,
        slots: req.slots,
      })
    }
    res.data = result
  }
}
