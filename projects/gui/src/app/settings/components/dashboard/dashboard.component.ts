import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { ObjectService } from '@ha4us/ng'
import { Subscription } from 'rxjs'
@Component({
  selector: 'ha4us-dashboard-settings',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  @Input() settings

  @Output() changed: EventEmitter<any> = new EventEmitter()

  form: FormGroup
  allTags = this.os.allTags$
  sub: Subscription
  constructor(protected fb: FormBuilder, protected os: ObjectService) {}
  ngOnInit() {
    console.log(this.settings)
    this.form = this.fb.group({
      tags: [this.settings.tags],
    })
    this.sub = this.form.valueChanges.subscribe(val => {
      this.changed.emit(val)
    })
  }
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe()
    }
  }
}
