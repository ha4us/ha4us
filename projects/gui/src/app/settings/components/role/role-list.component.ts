import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core'
import { FormBuilder, FormControl, FormGroup, FormArray } from '@angular/forms'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { Observable, Subscription } from 'rxjs'

import { Ha4usRoleDefinition, ObjectService } from '@ha4us/ng'

import { DEFAULT_ROLEDEFINITIONS } from '@ha4us/ng'
import {
  map,
  mergeMap,
  debounceTime,
  take,
  withLatestFrom,
} from 'rxjs/operators'

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, value))
}
function moveItemInFormArray(
  formArray: FormArray,
  fromIndex: number,
  toIndex: number
): void {
  const from = clamp(fromIndex, formArray.length - 1)
  const to = clamp(toIndex, formArray.length - 1)

  if (from === to) {
    return
  }

  const moving = formArray.at(from)
  formArray.removeAt(from)
  formArray.insert(to, moving)
}
@Component({
  selector: 'ha4us-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, OnDestroy {
  @Input() roles: Ha4usRoleDefinition[]

  @Output() changed: EventEmitter<Ha4usRoleDefinition[]> = new EventEmitter()

  sub: Subscription

  allRoles$ = this.os.roles$

  searchRole = new FormControl()
  filteredRoles = this.searchRole.valueChanges.pipe(
    withLatestFrom(this.os.roles$),
    map(val => {
      const [searchString, roles] = val
      const criteria = new RegExp('^' + searchString.replace('*', '.*?'), 'i')
      return roles.filter(role => criteria.test(role))
    })
  )

  rolesForm: FormArray

  constructor(protected fb: FormBuilder, protected os: ObjectService) {}

  ngOnInit() {
    this.rolesForm = this.fb.array(
      this.roles.map(role => this.getDetailForm(role))
    )

    this.sub = this.rolesForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe(val => this.changed.emit(val))
  }
  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe()
    }
  }

  getDetailForm(role: Ha4usRoleDefinition): FormGroup {
    return this.fb.group({
      selector: role.selector,
      label: role.label,
      image: role.image,
      color: role.color,
      backgroundColor: role.backgroundColor,
      hidden: role.hidden,
      template: role.template,
    })
  }

  addRole(index: number) {
    this.rolesForm.insert(index, this.getDetailForm({ selector: '*' }))
  }
  removeRole(index: number) {
    this.rolesForm.removeAt(index)
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInFormArray(
      this.rolesForm,
      event.previousIndex,
      event.currentIndex
    )
  }
}
