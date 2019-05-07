import { Pipe, PipeTransform } from '@angular/core'
import { convertWildcarded } from 'ha4us/core'

@Pipe({
  name: 'wildcard',
  pure: true,
})
export class WildcardPipe implements PipeTransform {
  pattern: string
  regexp: RegExp
  transform(value: any, pattern?: any): boolean {
    if (pattern !== this.pattern) {
      this.pattern = pattern
      this.regexp = convertWildcarded(pattern)
    }

    return this.regexp.test(value)
  }
}
