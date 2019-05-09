import { IHa4usLogger } from 'ha4us/adapter'

import { Ha4usError} from 'ha4us/core'
import { StatefulObjects, MapService } from 'ha4us/adapter/features'
import { MongoClient, Db, Collection, Cursor, AggregationCursor } from 'mongodb'
import { cursorToRx } from 'ha4us/adapter/features/mongoFactory'
import * as got from 'got'
import { Observable } from 'rxjs/Observable'
import {AbstractIntent} from './AbstractIntent'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/toArray'
import 'rxjs/add/operator/toPromise'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/concatMap'


const ANSWER = `  {{#if data.contacts.length}}
    Offen sind noch {{#each data.contacts}}{{this}},{{/each}}!
  {{else}}Alles in Ordnung!
  {{/if}}`

export default class GetStatus extends AbstractIntent {

  protected $log: IHa4usLogger
    protected db: Collection
      protected $os: StatefulObjects


  constructor($log: IHa4usLogger, $os: StatefulObjects, $maps: MapService) {
    super($maps)
    this.$log = $log
    this.$os = $os
  }

  async handleRequest(req: any, res: any) {
    this.$log.debug ('GetStatus was called', req)

    const result = (await this.$os.get({tags: ['#contact']}))
      .filter((item: any) => ((item.state.val === true)))
      .map ((item: any) => (item.object.name))
    this.$log.debug ('Result is', result)
    res.say(this.createText(ANSWER, {data: {contacts: result}}))

  }
}
