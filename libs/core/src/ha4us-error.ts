export class Ha4usError extends Error {
  public readonly name = 'Ha4usError'
  public code: number
  public orig: Error

  public static generateError(code: number, msg: string, e?: Error) {
    return new Ha4usError(code, msg, e)
  }
  public static wrapErr<T = any>(err: any): T {
    if (err.name === 'MongoError' && err.code === 11000) {
      throw new Ha4usError(409, 'object already exists', err)
    } else if (err.code === 'ENOENT') {
      throw new Ha4usError(404, 'file not found', err)
    } else if (err.name === 'HttpErrorResponse') {
      throw new Ha4usError(err.status, err.message, err)
    } else {
      throw new Ha4usError(500, 'server error', err)
    }
  }

  // ignored because the super call is marked by istanbul
  /* istanbul ignore next */
  constructor(code: number, msg: string, e?: Error) {
    super(msg)
    this.code = code
    this.message = code + ' - ' + msg
    if (e) {
      this.orig = e
      this.message = this.message + ' (' + e.message + ')'
    }
  }
}
