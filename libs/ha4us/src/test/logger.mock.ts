import { Ha4usLogger } from '../core'
import * as Debug from 'debug'

export function LoggerMock(name: string): Ha4usLogger {
  const debug = Debug('ha4us:test:' + name)

  /* istanbul ignore next */
  function log(level: string) {
    return (...val: any[]) => {
      debug(level, ...val)
    }
  }

  return {
    silly: log('silly'),
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
  }
}
