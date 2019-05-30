import {
  StateService,
  YamlService,
  ObjectService,
  MediaService,
} from '@ha4us/adapter'
import { DateTime } from 'luxon'
import { ScheduleEvent, TimeDefinition } from 'us-scheduler'
import {
  Ha4usOperators,
  Ha4usLogger,
  Ha4usMessage,
  Ha4usObject,
  render,
  compile,
  randomString,
  Ha4usMediaDefinition,
} from '@ha4us/core'
import * as rxjs from 'rxjs'
import { Observable } from 'rxjs'
import { Ha4usScript } from './ha4us-script'

/*onlyRetained: rxjs.MonoTypeOperatorFunction<Ha4usMessage>;
    noRetained: rxjs.MonoTypeOperatorFunction<Ha4usMessage>;
    pick: typeof Ha4usOperators.pick;
    pickEach: typeof Ha4usOperators.pickEach;
    render: typeof render;
    compileTemplate: typeof compile;
    randomString: typeof randomString;*/

declare namespace http {
  function parse(url: string, query: object): Promise<CheerioStatic>
  function get(url: string, query: object): Promise<string>
}
declare namespace console {
  function log(...args: any[]): void
  function debug(...args: any[]): any
  function warn(...args: any[]): any
  function info(...args: any[]): any
  function error(...args: any[]): any
}
declare namespace log {
  function log(...args: any[]): void
  function debug(...args: any[]): any
  function warn(...args: any[]): any
  function info(...args: any[]): any
  function error(...args: any[]): any
}

declare function require(md: string): any
declare function observe(
  topic: string,
  ...params: any[]
): rxjs.Observable<Ha4usMessage>
declare function combine(...pattern: string[]): Observable<Ha4usMessage[]>
declare function set(topic: string, value: any): Promise<any>
declare function get(topic: string): Promise<Ha4usMessage>
declare function status(
  topic: string,
  value: any,
  retained?: boolean
): Promise<Ha4usMessage>
declare function schedule(
  ...times: TimeDefinition[]
): Observable<ScheduleEvent>
declare function cron(cronPattern: string): Observable<DateTime>
declare function doIn<T>(duration: string | number, data?: T): Observable<T>
declare function doAt<T>(date: DateTime | string, data?: T): Observable<T>
declare function load(file: string): any
declare function save(data: any, file: string): any
declare function createObject(
  topic: string,
  data: Partial<Ha4usObject>
): Promise<Ha4usObject>
declare function $onDestroy(destroyFunc: () => void): void
declare function random(maxOrMin: number, max?: number): number
declare function downloadImage(
  url: string,
  fileOptions: Partial<Ha4usMediaDefinition>
): Promise<string>
declare function event(msg: string, opt: any): void
