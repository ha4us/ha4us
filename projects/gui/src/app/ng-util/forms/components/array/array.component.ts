import { Component, OnInit, Input } from '@angular/core'

import {
  FormGroup,
  FormArray,
  Validators,
  FormBuilder,
  ControlContainer,
} from '@angular/forms'
import { DynamicFormArray } from '../../models/forms'
import { FormbuilderService } from '../../services/formbuilder.service'
@Component({
  selector: 'us-form-array',
  templateUrl: './array.component.html',
  styleUrls: ['./array.component.scss'],
})
export class ArrayComponent implements OnInit {
  @Input() control: DynamicFormArray

  formArray: FormArray
  parentGroup: FormGroup
  constructor(
    protected fbs: FormbuilderService,
    protected controlContainer: ControlContainer
  ) {}

  ngOnInit() {
    this.parentGroup = this.controlContainer.control as FormGroup
    if (this.control.id && this.parentGroup.contains(this.control.id)) {
      this.formArray = this.parentGroup.get(this.control.id) as FormArray
    } else {
      throw new Error(`A us-dynamic-array ${this.control.id} not found`)
    }
  }

  add(idx: number) {
    this.formArray.insert(idx, this.fbs.newArrayGroup(this.control.controls))
  }
  delete(idx: number) {
    this.formArray.removeAt(idx)
  }
}
