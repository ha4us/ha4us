import { Pipe, PipeTransform } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
@Pipe({
  name: 'sanitize',
})
export class SanitizePipe implements PipeTransform {
  constructor(protected ds: DomSanitizer) {}

  transform(value: any): any {
    return this.ds.bypassSecurityTrustResourceUrl(value)
  }
}
