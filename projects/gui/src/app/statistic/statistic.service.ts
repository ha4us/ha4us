import { Injectable } from '@angular/core';

import { StatesService } from '@ha4us/ng';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class StatisticService {
  constructor(protected states: StatesService) {}

  inventory(topic?: string) {
    return this.states
      .request('history/query', { topic })
      .then(data => data.val);
  }

  aggregate(topic: string, aggregateBy: string = 'none') {
    const mom = moment().subtract(3, 'month');
    return this.states
      .request('history/aggregate', {
        topic,
        aggregateBy,
        from: mom.toISOString(),
      })
      .then(data => {
        return {
          name: topic,
          series: data.val.map(point => ({
            name: new Date(point.name),
            value: point.value,
            min: point.min,
            max: point.max,
            readings: point.readings,
          })),
        };
      });
  }
  aggregateBar(topic: string, aggregateBy: string = 'none') {
    return this.states
      .request('history/aggregate', { topic, aggregateBy })
      .then(data => {
        return {
          name: topic,
          series: data.val
            // .filter((_, idx) => idx >= 1000)
            .map(point => ({
              name: new Date(point.name),
              value: point.readings,
            })),
        };
      });
  }
}
