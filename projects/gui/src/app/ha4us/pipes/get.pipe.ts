import { Pipe, PipeTransform } from '@angular/core'
import { get } from 'ha4us/core'

@Pipe({
  name: 'get'
})
export class GetPipe implements PipeTransform {

  transform(value: any, ...args: string[]): any {
    if (args.length === 1) {
      return get(value, args[0])

    } else {
      return get(value, args)
    }

  }

}
