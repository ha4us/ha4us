import {
  Component,
  OnInit,
  Input,
  ComponentFactoryResolver,
  ComponentFactory,
  ViewContainerRef,
  ViewChild,
  forwardRef,
  ComponentRef,
  Optional,
  Host,
  Self,
  Inject,
  SkipSelf,
  Output,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  EventEmitter,
  InjectFlags,
} from '@angular/core'

import {
  ControlValueAccessor,
  DefaultValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
  NG_ASYNC_VALIDATORS,
  AsyncValidator,
  AsyncValidatorFn,
  ValidatorFn,
  Validator,
  NG_VALIDATORS,
  ControlContainer,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms'

import { DynamicFormControl } from '../../models/forms'

import { FormbuilderService } from '../../services/formbuilder.service'
import { NG_MODEL_WITH_FORM_CONTROL_WARNING } from '@angular/forms/src/directives'
import { FormLibraryService } from '../../services/formlibrary.service'

export function normalizeValidator(
  validator: ValidatorFn | Validator
): ValidatorFn {
  if ((validator as Validator).validate) {
    return (c: AbstractControl) => (validator as Validator).validate(c)
  } else {
    return validator as ValidatorFn
  }
}
@Component({
  selector: 'us-dynamic-control',
  templateUrl: './dynamic-control.component.html',
  styleUrls: ['./dynamic-control.component.scss'],
})
export class DynamicControlComponent implements OnInit, OnDestroy {
  @Input() controlDefinition: DynamicFormControl

  @ViewChild('controlplaceholder', { read: ViewContainerRef })
  vcr: ViewContainerRef
  componentRef: ComponentRef<any>
  component: any

  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  get path(): string[] {
    return [...this.parent.path, this.controlDefinition.id]
  }

  get formDirective(): any {
    return this.parent ? this.parent.formDirective : null
  }

  fc: FormControl

  name: string

  constructor(
    protected resolver: ComponentFactoryResolver,
    protected fbs: FormLibraryService,
    @Optional() @SkipSelf() protected parent: ControlContainer
  ) {}

  ngOnInit() {
    if (this.controlDefinition) {
      const descriptor = this.fbs.getCustomControl(this.controlDefinition)

      const componentFactory: ComponentFactory<
        any
      > = this.resolver.resolveComponentFactory(descriptor.component)

      this.componentRef = this.vcr.createComponent(
        componentFactory,
        0,
        this.vcr.injector
      )

      if (typeof this.componentRef.instance.writeValue === 'function') {
        this.fc = this.parent.control.get(
          this.controlDefinition.id
        ) as FormControl
      } else {
        this.componentRef.instance.formControl = this.parent.control.get(
          this.controlDefinition.id
        ) as FormControl
      }

      this.component = this.componentRef.instance

      this.name = this.controlDefinition.id

      if (descriptor.param) {
        this.component[descriptor.param] = descriptor.value
      }

      const inputs = componentFactory.inputs.map(prop => prop.propName)

      Object.keys(this.controlDefinition)
        .filter(input => input !== 'type' && input !== 'id')
        .forEach(prop => {
          if (inputs.indexOf(prop) > -1) {
            this.component[prop] = this.controlDefinition[prop]
          } else {
            console.warn(
              `${this.componentRef.componentType.name}(${
                this.controlDefinition.type
              }:${
                this.controlDefinition.id
              }) No input for ${prop} found - skipping`
            )
          }
        })
    }
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.

    if (this.componentRef) {
      this.componentRef.destroy()
    }
  }
}
