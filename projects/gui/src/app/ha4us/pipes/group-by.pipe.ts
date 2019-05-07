import { Pipe, PipeTransform } from '@angular/core'
import { groupBy } from 'ha4us/core'
@Pipe({
  name: 'groupBy'
})
export class GroupByPipe implements PipeTransform {

  transform(objArray: any[], property: string): any {
    if (objArray) {
      const result = groupBy(objArray, obj => obj[property])
      Object.keys(result).forEach((key) => {
        if (result[key].length === 1) {
          result[key] = result[key][0]
        }
      })
      return result
    } else {
      return objArray
    }

  }

}
