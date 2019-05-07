import { filter, map } from 'rxjs/operators';
import { MonoTypeOperatorFunction, OperatorFunction } from 'rxjs';
import { get, convertBuffer } from './helper';
import { MqttMessage, Ha4usMessage, Ha4usObject } from './types';

export namespace Ha4usOperators {
  export const mqttToHa4us: OperatorFunction<MqttMessage, Ha4usMessage> = map(
    (message: MqttMessage) => {
      const msg = convertBuffer(message.payload);

      return {
        topic: message.topic,
        val: msg && msg.hasOwnProperty('val') ? msg.val : msg,
        ts: msg !== null && msg.ts ? msg.ts : new Date().toISOString(),
        old: msg && msg.old,
        lc: msg && msg.lc,
        retain: message.retain,
      };
    }
  );

  export const onlyRetained: MonoTypeOperatorFunction<Ha4usMessage> = filter<
    Ha4usMessage
  >((msg: Ha4usMessage) => msg.retain === true);

  export const noRetained: MonoTypeOperatorFunction<Ha4usMessage> = filter<
    Ha4usMessage
  >((msg: Ha4usMessage) => msg.retain === false);

  export const pickTopic: OperatorFunction<
    Ha4usMessage | Ha4usObject,
    string
  > = pick('topic');

  export function pick<T>(path: string): OperatorFunction<T, any> {
    return map((msg: T) => get(msg, path));
  }

  export function pickEach<T>(path: string): OperatorFunction<T[], any[]> {
    return map((msgs: T[]) => (<any[]>msgs).map(msg => get(msg, path)));
  }
}
