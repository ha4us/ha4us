import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core'
import { MatDialog, MatPaginator, MatSort } from '@angular/material'
import { ActivatedRoute } from '@angular/router'
import { Ha4usMessage, MqttUtil } from '@ha4us/core'
import { Observable, Subject } from 'rxjs'
import { debounceTime, map, scan, switchMap, take, tap } from 'rxjs/operators'
import { StatesService } from '@ha4us/ng'
import { MqttDatasource } from './mqtt-datasource'
import { FormControl } from '@angular/forms'

const debug = require('debug')('ha4us:gui:state:mqtt')

@Component({
  selector: 'ha4us-mqtt',
  templateUrl: './mqtt.component.html',
  styleUrls: ['./mqtt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MqttComponent implements OnInit {
  public targetValue: string

  public nextTopic: Subject<string> = new Subject()

  public topicControl = new FormControl()

  public states$: Observable<Ha4usMessage[]> = this.nextTopic.pipe(
    switchMap(topic =>
      this.$states.observe(topic).pipe(
        map(state => {
          if (typeof state.val === 'string' && state.val.length > 40) {
            state.val = ''
          }
          return state
        }),
        scan((acc: Ha4usMessage[], val: Ha4usMessage) => {
          acc.push(val)
          /*if (acc.length > this.rowsToDisplay) {
                            acc = acc.slice(
                                acc.length - this.rowsToDisplay,
                                acc.length
                            )
                        }*/
          return acc
        }, []),
        debounceTime(500),
        tap(data => {
          this.paginator.lastPage()
        })
      )
    )
  )

  public resultArray
  public columnsToDisplay = ['ts', 'topic', 'val', 'buttons']

  public rowsToDisplay = 10
  dataSource = new MqttDatasource<Ha4usMessage>(this.states$)

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator
  @ViewChild(MatSort, { static: false }) sort: MatSort
  @ViewChild('detailView', { static: false }) details

  detailMsg: any

  constructor(
    private $states: StatesService,
    protected cdr: ChangeDetectorRef,
    protected zone: NgZone,
    protected route: ActivatedRoute,
    protected dialog: MatDialog
  ) {}

  ngOnInit() {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort

    this.route.queryParamMap.pipe(take(1)).subscribe(queryMap => {
      debug('Route params', queryMap)
      if (queryMap.has('topic')) {
        this.topicControl.setValue(queryMap.get('topic'))
        this.subscribe()
      }
    })

    // this.dataSource = new MqttDatasource(this.states$)
  }

  public setValue(topic: string, val: string) {
    this.$states.set(topic, val)
  }

  subscribe() {
    this.nextTopic.next(this.topicControl.value)
    /* this.zone.runOutsideAngular(() => {
        })*/
  }

  deleteState(topic: string, $event: any) {
    debug('Deleting state', topic)
    this.$states.publish(topic, null, { retain: true, qos: 0 }).then(() => {
      this.subscribe()
    })
  }

  stripStatus(topic: string): string {
    return MqttUtil.splice(topic, 1, 1)
  }

  setable(topic: string) {
    return MqttUtil.isPattern(topic)
  }

  showDetails(msg: Ha4usMessage) {
    this.detailMsg = {
      topic: msg.topic,
      msg: { val: msg.val, ts: msg.ts, old: msg.old, lc: msg.lc },
    }

    const ref = this.dialog.open(this.details, {})
  }
}
