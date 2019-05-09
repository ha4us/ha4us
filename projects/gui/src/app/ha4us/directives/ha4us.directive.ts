import {
  AfterViewInit,
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  ChangeDetectorRef,
} from '@angular/core'
import Debug from 'debug'
import { Ha4usMessage, MqttUtil } from '@ha4us/core'

import { Subject, Subscription } from 'rxjs'
import { filter, switchMap } from 'rxjs/operators'
import { StatesService } from '../services/state.service'

const debug = Debug('ha4us:gui:state:ha4usDirective')

export class Ha4usContext {
  $implicit: Ha4usMessage
  ha4us: Ha4usDirective
}

@Directive({
  selector: '[ha4us]',
})
export class Ha4usDirective implements OnInit, AfterViewInit, OnDestroy {
  protected _topic: string
  protected _context: Ha4usContext

  protected _subscribeMode = false
  protected topic$: Subject<string> = new Subject<string>()
  protected _sub: Subscription

  @Input('ha4usOf')
  get topic() {
    return this._topic
  }
  set topic(aTopic: string) {
    this._subscribeMode = true
    this.topic$.next(aTopic)
    this._topic = aTopic
  }

  @Input('ha4us')
  set ha4us(aTopic: string) {
    if (aTopic) {
      this._subscribeMode = false
      this.topic$.next(aTopic)
      this._topic = aTopic
    }
  }

  constructor(
    private _viewContainer: ViewContainerRef,
    protected _templateRef: TemplateRef<Ha4usContext>,
    protected _$states: StatesService,
    protected cdr: ChangeDetectorRef
  ) {
    const mqtt$ = this.topic$.pipe(
      filter(MqttUtil.validPattern),
      filter(() => this._subscribeMode),
      filter(topic => topic !== this._topic),
      filter(topic => !!topic),
      switchMap(topic => this._$states.observe(topic))
    )

    this._sub = mqtt$.subscribe((val: Ha4usMessage) => {
      this._context.$implicit = val
      this.cdr.markForCheck()
    })

    this._context = {
      $implicit: {
        topic: this._topic,
        val: undefined,
        ts: '',
        retain: true,
      },
      ha4us: this,
    }
  }

  public ngOnInit() {
    this._viewContainer.createEmbeddedView(this._templateRef, this._context)
  }

  public ngAfterViewInit() {
    this.topic$.next(this._topic)
  }

  ngOnDestroy() {
    debug('Destroying', this._topic)
    this._sub.unsubscribe()
    this.topic$.complete()
  }

  public set(value: any): void {
    if (this._topic && !this.isPattern) {
      this._$states.set(this._topic, value)
    }
  }
  public get(): void {
    if (this._topic && !this.isPattern) {
      this._$states.get(this._topic)
    }
  }

  public get isPattern(): boolean {
    return MqttUtil.isPattern(this._topic)
  }
}
