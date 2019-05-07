export interface IPager<T> {
  page: number
  pages: number
  pageSize: number
  length: number
  data: T[]
}

export interface Ha4usLogger {
  debug(...args: any[]): any
  error(...args: any[]): any
  warn(...args: any[]): any
  info(...args: any[]): any
  silly(...args: any[]): any
}
