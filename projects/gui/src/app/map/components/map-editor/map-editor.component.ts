import { Inject, Component, OnInit, ViewEncapsulation } from '@angular/core'

import {
  Form,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms'

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatSelectChange,
} from '@angular/material'

import { MapService } from '../../services/map.service'
import {
  IValueCondition,
  IValueMap,
  IValueIfStatement,
  ValueMap,
  ValueCondition,
  TValueOperator,
} from '@ha4us/core'

export interface MapEditorResponse {
  action: 'delete' | 'save' | 'cancel'
  map?: IValueMap<any, any>
}

import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop'

@Component({
  selector: 'ha4us-map-editor',
  templateUrl: './map-editor.component.html',
  styleUrls: ['./map-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MapEditorComponent implements OnInit {
  public mapForm: FormGroup

  public show: number

  public operators: { op: TValueOperator }[] = [
    { op: '=' },
    { op: '!=' },
    { op: '>=' },
    { op: '<=' },
    { op: '<' },
    { op: '>' },
    { op: 'isBetween' },
    { op: 'contains' },
    { op: 'matches' },
  ]

  constructor(
    protected dialogRef: MatDialogRef<MapEditorComponent, MapEditorResponse>,
    @Inject(MAT_DIALOG_DATA) public data,
    protected fb: FormBuilder
  ) {
    console.log('Diag Called', data)

    this.mapForm = this.fb.group(
      {
        name: [data.map.name, Validators.required],
        description: [data.map.description],
        else: data.map.elseVal,
        type: data.type || data.map.type,
        ifthens: this.fb.array(
          data.map.ifthens
            ? data.map.ifthens.map(this.createConditionForm.bind(this))
            : []
        ),
      },
      { validator: [] }
    )
  }

  ngOnInit() {}

  createConditionForm(condition: IValueIfStatement<any, any>): FormGroup {
    return this.fb.group({
      if: this.fb.group({
        op: [condition.if.op, Validators.required],
        value: this.fb.array(condition.if.value),
      }),
      then: [condition.then, Validators.required],
    })
  }

  addCondition(i = -1) {
    const ifthens = this.mapForm.get('ifthens') as FormArray
    if (i > 0) {
      ifthens.insert(
        i,
        this.createConditionForm({
          if: {
            op: '=',
            value: [undefined],
          },
          then: undefined,
        })
      )
    } else {
      ifthens.push(
        this.createConditionForm({
          if: {
            op: '=',
            value: [undefined],
          },
          then: undefined,
        })
      )
    }
  }

  deleteCondition(idx: number) {
    const conditions = this.mapForm.get('ifthens') as FormArray
    conditions.removeAt(idx)
  }

  selectOperator(ev: MatSelectChange, condIdx: number) {
    const op: TValueOperator = ev.value
    const parCount = ValueCondition.getParamCount(op)

    const values: FormArray = (<FormArray>this.mapForm.get('ifthens')).controls[
      condIdx
    ].get('if.value') as FormArray

    if (values.controls.length > parCount) {
      while (values.controls.length > parCount) {
        values.removeAt(values.controls.length - 1)
      }
    } else {
      while (values.controls.length < parCount) {
        values.push(this.fb.control(undefined))
      }
    }
  }

  submitForm() {
    this.dialogRef.close({
      action: 'save',
      map: this.mapForm.getRawValue(),
    })
  }

  delete() {
    this.dialogRef.close({ action: 'delete', map: this.data.map })
  }

  cancel() {
    this.dialogRef.close({ action: 'cancel' })
  }

  enter(drag?: CdkDrag, drop?: CdkDropList) {
    // console.log('Enter', drag, drop)
  }

  drop(event: CdkDragDrop<string[]>) {
    console.log('Dropped', event)
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    )
    /*
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {

    }*/
  }
}
