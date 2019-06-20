import { Inject, Injectable, Optional, SkipSelf, Type } from '@angular/core'
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms'
import {
  DynamicForm,
  DynamicFormArray,
  DynamicFormControl,
  DynamicFormGroup,
} from '../models/forms'
// @dynamic
import {
  DynamicFormControlDescription,
  METADATA_KEY,
  PARAM_MATCH,
} from './form.decorator'
import { US_FORM_CONTROLS } from './form_control.token'

@Injectable()
export class FormLibraryService {
  static count = 0

  validationMessages: any = {}

  controlDict = new Map<string, DynamicFormControlDescription>()
  constructor(
    protected fb: FormBuilder,
    @Inject(US_FORM_CONTROLS)
    customControls: Type<any>[][],
    @Optional() @SkipSelf() protected fbs: FormLibraryService
  ) {
    if (fbs) {
      if (customControls) {
        customControls.forEach(controlset => {
          if (controlset) {
            fbs.registerControls(controlset)
          }
        })
      }
      return fbs
    }

    customControls.forEach(controlset => {
      if (controlset) {
        this.registerControls(controlset)
      }
    })
  }

  registerControls(customControlSet: Type<any>[] = []) {
    //
    customControlSet.forEach(control => {
      //
      const metadata = Reflect.get(control, METADATA_KEY)
      if (!metadata) {
        throw new Error(`No metadata for control ${control.name}`)
      }

      this.controlDict.set(metadata.name, {
        param: metadata.param,
        component: control,
      })
    })
  }

  getCustomControl(config: DynamicFormControl): DynamicFormControlDescription {
    const match = PARAM_MATCH.exec(config.type)

    if (!match) {
      throw new Error(`control of type ${config.type} does not exist`)
    }
    const [_, name, param] = match

    const description = this.controlDict.get(name)
    if (!description) {
      throw new Error(`control of type ${name} does not exist`)
    }

    description.value = param
    return description
  }
}
