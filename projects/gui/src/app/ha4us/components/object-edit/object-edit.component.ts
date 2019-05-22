import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { Ha4usObject, Ha4usRole } from '@ha4us/core'
import { Subscription } from 'rxjs'
import { debounceTime, filter } from 'rxjs/operators'
import { ObjectService } from '../../services/object.service'

@Component({
  selector: 'ha4us-object-edit',
  templateUrl: 'object-edit.component.html',
  styleUrls: ['object-edit.component.scss'],
})
export class ObjectEditComponent implements OnInit, OnDestroy {
  public objectEditForm: FormGroup

  @Input()
  public set object(obj: Ha4usObject) {
    if (this.objectEditForm) {
      this.objectEditForm.reset({}, { emitEvent: false })
      if (obj) {
        this.enabled = true
        this.objectEditForm.enable({ emitEvent: false })
        this.objectEditForm.patchValue(obj, { emitEvent: false })
      } else {
        this.enabled = false
        this.objectEditForm.disable({ emitEvent: false })
      }
    }
  }
  @Output() objectChange = new EventEmitter<Ha4usObject>()

  public enabled = false
  public sub: Subscription

  public types: string[] = ['string', 'boolean', 'number', 'object', 'any']

  public roles = Object.keys(Ha4usRole).map(key => ({
    label: key,
    value: Ha4usRole[key],
  }))

  constructor(private _fb: FormBuilder, public os: ObjectService) {
    this.objectEditForm = this._fb.group({
      topic: ['topic'],
      label: ['label'],
      type: ['type'],
      tags: [[]],
      min: [undefined],
      max: [undefined],
      template: [undefined],
      role: [undefined],
      image: [undefined],
      hidden: [undefined],
      map: [undefined],
      can: this._fb.group({
        read: [false],
        write: [false],
        trigger: [false],
      }),
      native: [{}],
    })
    this.objectEditForm.disable()
  }

  public ngOnInit() {
    this.sub = this.objectEditForm.valueChanges
      .pipe(
        filter(() => this.objectEditForm.valid),
        debounceTime(1000)
      )
      .subscribe(data => {
        this.objectChange.next(data)
      })
  }
  public ngOnDestroy() {
    this.sub.unsubscribe()
  }
}
