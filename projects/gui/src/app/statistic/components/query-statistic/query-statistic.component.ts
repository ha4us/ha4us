import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  EventEmitter,
  OnDestroy,
  Input,
  Output,
} from '@angular/core'
import {
  StatisticService,
  StatisticQuery,
} from '@app/statistic/statistic.service'
import { FormBuilder, FormGroup, Validator, Validators } from '@angular/forms'
import { Subscription } from 'rxjs'

@Component({
  selector: 'ha4us-query-statistic',
  templateUrl: './query-statistic.component.html',
  styleUrls: ['./query-statistic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryStatisticComponent implements OnInit, OnDestroy {
  inventory = this.stats.inventory()

  queryForm: FormGroup

  @Input() query: StatisticQuery
  @Output() queryChange: EventEmitter<StatisticQuery> = new EventEmitter()

  sub: Subscription

  constructor(protected fb: FormBuilder, protected stats: StatisticService) {
    this.queryForm = this.fb.group({
      topic: [undefined, Validators.required],
      to: [],
      duration: 'P3M',
      aggregateBy: 'none',
    })
  }

  ngOnInit() {
    if (this.query) {
      this.queryForm.patchValue(this.query)
    }
    this.sub = this.queryForm.valueChanges.subscribe(val => {
      this.queryChange.emit(val)
    })
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.sub) {
      this.sub.unsubscribe()
    }
  }
}
