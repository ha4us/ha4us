import { Directive, forwardRef, Input } from '@angular/core'
import { NG_VALIDATORS, Validator, FormControl } from '@angular/forms'

import { compile } from '@ha4us/core'
@Directive({
  selector: 'textarea[ha4usTemplate]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TemplateInputDirective),
      multi: true,
    },
  ],
})
export class TemplateInputDirective implements Validator {
  @Input() ha4usTemplate: any
  constructor() {}

  validate(c: FormControl): { [key: string]: any } {
    try {
      const compiled = compile(c.value)(this.ha4usTemplate)
      return null
    } catch (e) {
      return { template: e.message }
    }
  }
}
