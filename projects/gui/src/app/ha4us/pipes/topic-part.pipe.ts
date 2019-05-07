import { Pipe, PipeTransform } from '@angular/core'
import { MqttUtil } from 'ha4us/core'
@Pipe({
  name: 'topicPart',
})
export class TopicPartPipe implements PipeTransform {
  transform(value: string, last = 1): any {
    return MqttUtil.slice(value, -1 * last)
  }
}
