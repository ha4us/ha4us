import {
  Pipe,
  PipeTransform,
  OnDestroy,
  WrappedValue,
  ChangeDetectorRef,
} from '@angular/core'

import { Observable, Subscription, Subject } from 'rxjs'

import { scan } from 'rxjs/operators'
import { Ha4usMessage } from 'ha4us/core'
import { StatesService } from '../services/state.service'
@Pipe({
  name: 'ha4usState',
  pure: false,
})
export class Ha4usStatePipe implements PipeTransform, OnDestroy {
  protected sub: Subscription

  protected pattern: string

  protected pattern$ = new Subject<string>()

  protected latestVal: any
  protected latestReturnedValue: any

  constructor(
    protected state: StatesService,
    protected ref: ChangeDetectorRef
  ) {}
  transform(topicPattern: string, count?: number): any {
    if (topicPattern && this.pattern !== topicPattern) {
      this.pattern = topicPattern
      this._dispose()
      let observable: Observable<
        Ha4usMessage | Ha4usMessage[]
      > = this.state.observe(this.pattern)
      observable =
        count > 1
          ? observable.pipe(
              scan((acc: Ha4usMessage[], val: Ha4usMessage) => {
                acc.push(val)
                return acc.slice(-1 * count)
              }, [])
            )
          : observable
      this.sub = observable.subscribe(val => {
        this._updateLatestValue(val)
      })
    }

    if (this.latestVal === this.latestReturnedValue) {
      return this.latestReturnedValue
    }

    this.latestReturnedValue = this.latestVal
    return WrappedValue.wrap(this.latestVal)
  }

  private _updateLatestValue(value: object): void {
    if (this.latestVal !== value) {
      this.latestVal = value
      this.ref.markForCheck()
    }
  }

  _dispose() {
    if (this.sub) {
      this.sub.unsubscribe()
    }
  }

  ngOnDestroy() {
    this._dispose()
    this.pattern$.complete()
  }
}
