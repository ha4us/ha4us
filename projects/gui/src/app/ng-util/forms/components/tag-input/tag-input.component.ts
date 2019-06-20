import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Host,
  Optional,
  SkipSelf,
} from '@angular/core'

import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  NgControl,
} from '@angular/forms'

import {
  MatChipInputEvent,
  MatAutocompleteSelectedEvent,
} from '@angular/material'
import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { UsFormControl } from '../../services/form.decorator'
import { UsDynamicBaseControl } from '../../models/abstract-dynamic-control'

@Component({
  selector: 'us-tag-input',
  templateUrl: './tag-input.component.html',
  styleUrls: ['./tag-input.component.scss'],
  /*providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TagInputComponent,
      multi: true,
    },
  ],*/
})
@UsFormControl('tags')
export class TagInputComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder: string

  @Input() availableTags: string[] = []

  @Input() set values(tags: string[]) {
    this.availableTags = tags || []
  }

  filteredTags: Observable<string[]>

  currentTags: string[] = []

  protected _onChange: (_any) => void
  protected _onTouched: (_any) => void

  separatorKeysCodes: number[] = [ENTER, COMMA]

  tagInputCtrl = new FormControl()
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>

  disabled = false
  constructor(@Optional() @Host() public formControl: NgControl) {
    if (this.formControl) {
      // Note: we provide the value accessor through here, instead of
      // the `providers` to avoid running into a circular import.
      this.formControl.valueAccessor = this
      this.filteredTags = this.tagInputCtrl.valueChanges.pipe(
        startWith(null),
        map((tag: string) =>
          tag ? this._filter(tag) : this.availableTags.slice()
        )
      )
    }
  }

  ngOnInit() {}

  removeTag(idx: number) {
    this.currentTags.splice(idx, 1)
    this.emitChange()
  }

  addTag(ev: MatChipInputEvent) {
    const newTag = ev.value.trim()
    if (newTag !== '' && this.currentTags.indexOf(newTag) < 0) {
      this.currentTags.push(newTag)
      this.emitChange()
    }
    ev.input.value = ''
    this.tagInputCtrl.setValue(null)
  }

  addTagFromAutocomplete(ev: MatAutocompleteSelectedEvent) {
    this.tagInput.nativeElement.value = ''
    this.tagInputCtrl.setValue(null)
    if (this.currentTags.indexOf(ev.option.viewValue) < 0) {
      this.currentTags.push(ev.option.viewValue)

      this.emitChange()
    }
  }

  emitChange() {
    if (this._onChange) {
      this._onChange([...this.currentTags])
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase()

    return this.availableTags
      .filter(tag => tag.toLowerCase().indexOf(filterValue) === 0)
      .filter(tag => this.currentTags.indexOf(tag) < 0)
  }

  ////////////////
  /// Control Value Accessor
  ///////////////
  public writeValue(value: string[]) {
    if (value) {
      this.currentTags = [...value]
    } else {
      this.currentTags = []
    }
  }

  public touch(value: any) {
    if (this._onTouched) {
      this._onTouched(value)
    }
  }

  public registerOnChange(fn: (_any) => void) {
    this._onChange = fn
  }

  public registerOnTouched(fn: (_any) => void) {
    this._onTouched = fn
  }

  public setDisabledState(disabled: boolean) {
    if (disabled) {
      this.tagInputCtrl.disable({ emitEvent: false })
    } else {
      this.tagInputCtrl.enable()
    }
    this.disabled = disabled
  }
}
