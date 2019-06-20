import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild,
  forwardRef,
  Host,
  SkipSelf,
  Optional,
} from '@angular/core'

import {
  AbstractControl,
  ControlValueAccessor,
  FormControlName,
  FormControl,
  ControlContainer,
  FormGroup,
  NgControl,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
} from '@angular/forms'

import { Observable, of, from } from 'rxjs'
import { filter, map, tap, mergeMap, catchError } from 'rxjs/operators'

import {
  MatDialog,
  MatFormFieldControl,
  MatSelectChange,
  MatSelect,
} from '@angular/material'

import { MapService } from '../../services/map.service'
import { IValueMap, ValueMap } from '@ha4us/core'
import {
  MapEditorComponent,
  MapEditorResponse,
} from '../map-editor/map-editor.component'

import { UsFormControl } from '@ulfalfa/ng-util'

@Component({
  selector: 'ha4us-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MapComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MapComponent),
      multi: true,
    },
  ],
})
@UsFormControl('map[type]')
export class MapComponent
  implements OnInit, AfterViewInit, ControlValueAccessor, Validator {
  @ViewChild(MatSelect) private valueAccessor: ControlValueAccessor

  @Input() placeholder: string
  @Input() required: boolean
  @Input() disabled: boolean
  @Input() type: string

  @Input() formControlName

  public fc: AbstractControl

  public maps: ValueMap<any, any>[] = []

  public get filteredMaps(): ValueMap<any, any>[] {
    return this.maps
  }

  constructor(
    protected ms: MapService,
    @Optional()
    @Host()
    private controlContainer: ControlContainer,
    protected matDialog: MatDialog
  ) {}

  ngOnInit() {
    this.maps = this.ms.getAll()

    this.fc = this.controlContainer.control.get(this.formControlName)
    if (this.maps.length === 0) {
      this.fc.disable({ emitEvent: false })
    }
  }

  ngAfterViewInit() {}

  public editDialog(mapName?: string): Observable<IValueMap<any, any>> {
    return of(this.ms.get(mapName)).pipe(
      catchError(e => {
        return of(
          ValueMap.from({
            name: mapName,
            type: this.type,
            ifthens: [],
          })
        )
      }),
      mergeMap((aMap: ValueMap<any, any>) => {
        const myRef = this.matDialog.open<
          MapEditorComponent,
          any,
          MapEditorResponse
        >(MapEditorComponent, {
          data: { type: this.type, map: aMap },
        })
        return myRef.afterClosed()
      }),
      map((answer: MapEditorResponse) => {
        switch (answer.action) {
          case 'delete':
            return this.ms.delete(answer.map.name)
          case 'save':
            return this.ms.put(answer.map)

          default:
            return
        }
      }),
      map(() => this.ms.get(mapName)),
      map(aMap => {
        this.maps.filter(mapToFilter => mapToFilter.type === this.type)
        return aMap.toJSON()
      })
    )
  }

  edit(event) {
    this.editDialog(this.fc.value).subscribe(val => {
      this.fc.setValue(val.name)
    })
    event.stopPropagation()
  }

  writeValue(obj: any): void {
    this.valueAccessor.writeValue(obj)
  }
  registerOnChange(fn: any): void {
    this.valueAccessor.registerOnChange(fn)
  }

  registerOnTouched(fn: any): void {
    this.valueAccessor.registerOnTouched(fn)
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
    this.valueAccessor.setDisabledState(isDisabled)
  }

  public validate(fc: FormControl) {
    if (!fc.value) {
      return of(null)
    }
    const found = this.ms
      .getAll()
      .find(aMap => aMap.type === this.type && aMap.name === fc.value)
    if (!!found) {
      return { notExist: true }
    } else {
      return null
    }
  }
}
