import { Pipe, PipeTransform, OnDestroy } from '@angular/core'
import { MqttUtil } from 'ha4us/core'

import { Observable, Subscription, Subject } from 'rxjs'

import { scan } from 'rxjs/operators'
import { Ha4usObject } from 'ha4us/core'
import { ObjectService } from '../services/object.service'

const debug = require('debug')('ha4us:object:object-pipe')

@Pipe({
  name: 'ha4usObject',
  pure: false,
})
export class Ha4usObjectPipe implements PipeTransform, OnDestroy {
  protected sub: Subscription
  protected curTopic: string

  protected curResult: any
  protected isPattern: boolean

  constructor(protected os: ObjectService) {}

  transform(topic: any): any {
    if (topic && this.curTopic !== topic) {
      debug(`Pipe Called ${topic}`)
      this.curTopic = topic
      this.isPattern = MqttUtil.isPattern(topic)
      this.ngOnDestroy()
      this.sub = this.os.observe(this.curTopic).subscribe(objArray => {
        debug('object changed', objArray)
        if (this.isPattern) {
          this.curResult = objArray
        } else {
          this.curResult = objArray[0]
        }
      })
    }
    return this.curResult
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe()
    }
  }
}
