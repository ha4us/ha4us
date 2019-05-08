import { Ha4usMessage } from '@ha4us/core';
import { DateTime } from 'luxon';

const debug = require('debug')('ha4us:history:eventclass');

export enum EventType {
  'Number' = 'number',
  'Boolean' = 'boolean',
  'String' = 'string',
  'Other' = 'other',
}
export interface EventIndex {
  topic: string;
  ts: Date;
}

export interface HistoryResult {
  value: any;
  name: DateTime;
}
export interface HistoryEventObject extends EventIndex {
  readings: number;
  [props: string]: any;
  values: {
    [segement: string]: any;
  };
}

export interface HistoryEventUpdate {
  query: EventIndex;
  update: {
    $set?: { [prop: string]: any };
    $inc?: { [prop: string]: any };
    $max?: { [prop: string]: any };
    $min?: { [prop: string]: any };
  };
}

export function createEvent(msg: Ha4usMessage): HistoryEvent {
  const type = typeof msg.val;

  switch (type) {
    case 'number':
      return new HistoryNumberEvent(msg);
    case 'boolean':
      return new HistoryBooleanEvent(msg);
    case 'string':
      return new HistoryEvent(msg, EventType.String);
    default:
      return new HistoryEvent(msg, EventType.Other);
  }
}

export function unwindEventObject(event: HistoryEventObject): HistoryResult[] {
  const result: HistoryResult[] = [];

  for (let i = 0; i < 3600; i++) {
    if (event.values.hasOwnProperty(i)) {
      const minute = Math.floor(i / 60);
      const second = i % 60;
      result.push({
        value: event.values[i],
        name: DateTime.fromJSDate(event.ts).set({ minute, second }),
      });
    }
  }
  return result;
}
export class HistoryEvent {
  ts: Date;

  segment: number;

  constructor(protected msg: Ha4usMessage, public readonly type: EventType) {
    const ts = DateTime.fromISO(msg.ts);

    debug('Timestamp', msg.ts, ts.isValid);
    this.ts = ts.startOf('hour').toJSDate();
    this.segment = ts.minute * 60 + ts.second;
  }

  toInsert(): HistoryEventObject {
    const retValue = {
      topic: this.msg.topic,
      type: this.type,
      ts: this.ts,
      readings: 1,
      values: {},
    };
    retValue.values[this.segment] = this.msg.val;

    return retValue;
  }

  toUpdate(): HistoryEventUpdate {
    const retValue = {
      query: {
        topic: this.msg.topic,
        ts: this.ts,
      },
      update: {
        $inc: { readings: 1 },
        $set: {},
      },
    };

    retValue.update.$set['values.' + this.segment] = this.msg.val;

    return retValue;
  }
}

export class HistoryNumberEvent extends HistoryEvent {
  constructor(msg) {
    super(msg, EventType.Number);
  }

  toInsert(): HistoryEventObject {
    const retVal = super.toInsert();
    retVal.sum = this.msg.val;
    retVal.min = this.msg.val;
    retVal.max = this.msg.val;

    return retVal;
  }

  toUpdate(): HistoryEventUpdate {
    const retVal = super.toUpdate();
    retVal.update.$inc.sum = this.msg.val;
    retVal.update.$min = {
      min: this.msg.val,
    };
    retVal.update.$max = {
      max: this.msg.val,
    };

    return retVal;
  }
}

export class HistoryBooleanEvent extends HistoryEvent {
  constructor(msg) {
    super(msg, EventType.Boolean);
  }

  toInsert(): HistoryEventObject {
    const retVal = super.toInsert();

    retVal.readingsTrue = this.msg.val === true ? 1 : 0;
    retVal.readingsFalse = this.msg.val === false ? 1 : 0;

    return retVal;
  }

  toUpdate(): HistoryEventUpdate {
    const retVal = super.toUpdate();

    if (this.msg.val === true) {
      retVal.update.$inc.readingsTrue = 1;
    } else {
      retVal.update.$inc.readingsFalse = 1;
    }

    return retVal;
  }
}
