import { Pipe, PipeTransform } from '@angular/core'

import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { compile, render, Ha4usMessage, isEqual } from 'ha4us/core'

@Pipe({
    name: 'template',
})
export class TemplatePipe implements PipeTransform {
    protected tpl: string
    protected renderFunc: any
    protected lastVal: any
    protected res: SafeHtml

    constructor(protected dms: DomSanitizer) {}

    transform(value: any, template: string): any {
        if (this.tpl !== template) {
            this.tpl = template
            this.renderFunc = compile(template)
            this.res = this.dms.bypassSecurityTrustHtml(this.renderFunc(value))
        }
        if (!isEqual(this.lastVal, value) && template) {
            this.lastVal = value

            this.res = this.dms.bypassSecurityTrustHtml(this.renderFunc(value))
        }

        return this.res
    }
}
