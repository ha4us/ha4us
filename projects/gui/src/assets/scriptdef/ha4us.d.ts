/*onlyRetained: rxjs.MonoTypeOperatorFunction<Ha4usMessage>;
    noRetained: rxjs.MonoTypeOperatorFunction<Ha4usMessage>;
    pick: typeof Ha4usOperators.pick;
    pickEach: typeof Ha4usOperators.pickEach;
    render: typeof render;
    compileTemplate: typeof compile;
    randomString: typeof randomString;*/

type DateTime = luxon.DateTime
declare const DateTime: luxon.DateTime

interface ComplexTime {
  time: SimpleTime
  random?: number
  offset?: number
  data?: any
}
interface MinTimes {
  min: SimpleTime[]
}
interface MaxTimes {
  max: SimpleTime[]
}
declare type SimpleTime = string
declare type TimeDefinition = SimpleTime | ComplexTime | MinTimes | MaxTimes
interface ScheduleEvent {
  index: number
  target: DateTime
  definition?: TimeDefinition
  data?: any
}
interface Ha4usObjectDisplay {
  label?: string
  image?: string
  color?: string
  backgroundColor?: string
  hidden?: boolean
  template?: string
}
interface Ha4usObject extends Ha4usObjectDisplay {
  topic: string
  _id?: string
  urn?: string
  type: string
  role?: string
  tags: string[]
  min?: number
  max?: number
  unit?: string
  can: {
    read: boolean
    write: boolean
    trigger: boolean
  }
  native: {
    [props: string]: any
  }
  constructor(topic: string)
}

interface Ha4usMediaDefinition {
  id?: string
  filename?: string
  tags: string[]
  owner: string
  dtl: number
  description: string
  native?: {
    [prop: string]: any
  }
  contentType?: string
}
interface Ha4usMessage {
  /** the mqtt topic to which this message was published to */
  topic: string
  /** the if matched by the mqtt matcher here goes the data */
  match?: {
    pattern: string
    params: string[]
  }
  val: any
  ts: string
  old?: any
  lc?: string
  retain: boolean
}
declare namespace http {
  function parse(url: string, query: object): Promise<any>
  function get(url: string, query: object): Promise<string>
}

// declare function require(md: string): any

declare function observe(
  topic: string,
  ...params: any[]
): Observable<Ha4usMessage>
declare function combine(...pattern: string[]): Observable<Ha4usMessage[]>
declare function set(topic: string, value: any): Promise<any>
declare function get(topic: string): Promise<Ha4usMessage>
/**
 * emits a status from the script
 * @param topic
 * @param value
 * @param retained
 */
declare function status(
  topic: string,
  value: any,
  retained?: boolean
): Promise<Ha4usMessage>
/**
 * emits a status from the script
 * @param topic
 * @param value
 * @param retained
 */
declare function emit(
  topic: string,
  value: any,
  retained?: boolean
): Promise<Ha4usMessage>

declare function schedule(...times: TimeDefinition[]): Observable<ScheduleEvent>

/**
 * Generates a croned observable
 * @param cronPattern
 */
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
