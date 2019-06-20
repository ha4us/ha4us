import { Component, OnInit } from '@angular/core'
import { MessageService, Msg } from '@app/main'
import { Ha4usObject, MqttUtil } from '@ha4us/core'
import { ObjectService, StatesService } from '@ha4us/ng'
import { Ha4usObjectCollectionEvent } from '@ha4us/ng/components/object-list/object-list.component'
import { combineLatest, Observable } from 'rxjs'
import { map, publishReplay, refCount, take } from 'rxjs/operators'

const debug = require('debug')('ha4us:gui:admin')
@Component({
  selector: 'ha4us-objects',
  templateUrl: './objects.component.html',
  styleUrls: ['./objects.component.scss'],
})
export class ObjectsComponent implements OnInit {
  newTopic: Observable<string>

  selectedObject: Ha4usObject
  constructor(
    protected os: ObjectService,
    protected states: StatesService,
    protected ms: MessageService
  ) {}

  ngOnInit() {
    this.newTopic = combineLatest(this.os.search$, this.os.topics$).pipe(
      map(data =>
        data[0].pattern &&
        !MqttUtil.isPattern(data[0].pattern) &&
        (data[1] as string[]).indexOf(data[0].pattern) < 0
          ? data[0].pattern
          : undefined
      ),
      publishReplay(1),
      refCount()
    )
  }

  newObject($event) {
    this.newTopic.pipe(take(1)).subscribe(topic => {
      this.os.create(topic)
    })
  }

  objectChanged($event: Ha4usObject) {
    this.os.upsert($event)
  }

  doAction($event: Ha4usObjectCollectionEvent) {
    debug('Doing Action', $event)

    switch ($event.type) {
      case 'add_child':
        this.os.upsert($event.source)
        break
      case 'delete':
        this.ms.confirm(Msg.DeleteReally).subscribe(result => {
          if (result) {
            this.os.remove($event.source.topic)
          }
        })
        break
      case 'watch':
        const topicToObserve = MqttUtil.join($event.source.topic, '#')
        debug('Observing', topicToObserve)
        this.states.goAndObserve(topicToObserve)
        break
      default:
        this.selectedObject = $event.source
    }
  }

  observeState(topic: string, event: any) {
    event.stopPropagation()

    const topicToObserve = MqttUtil.join(topic, '#')
    debug('Observing', topicToObserve)
    this.states.goAndObserve(topicToObserve)
  }

  add(event: any) {
    debug('Adding object', event)
    this.os.upsert(this.os.new(event))
  }
}
