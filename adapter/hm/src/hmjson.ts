import * as got from 'got'
import { Ha4usError, Ha4usLogger } from '@ha4us/core'

const JSON_URL = '/api/homematic.cgi'

export class HMJson {
  protected $log: Ha4usLogger
  protected hmUser: string
  protected hmPassword: string
  protected host: string
  protected sessionId: string = null
  protected timeoutTimer: NodeJS.Timer = null

  constructor($log: Ha4usLogger, $args: any) {
    this.$log = $log

    this.hmUser = $args.hmUser
    this.hmPassword = $args.hmPassword
    this.host = $args.hmAddress

    $log.debug(
      'Logging in to HMJson as %s with %s',
      this.hmUser,
      this.hmPassword
    )
  }

  protected async sendRequest(req) {
    this.$log.debug(`Sending request '${req.method}' to ${this.host}`)
    return got(`http://${this.host}${JSON_URL}`, {
      body: req,
      json: true,
    }).then(res => {
      const body = res.body
      if (body.error !== null) {
        throw new Ha4usError(
          body.error.code,
          body.error.name + '-' + body.error.message
        )
      } else {
        return body.result
      }
    })
  }

  public async login() {
    if (!this.sessionId) {
      return this.sendRequest({
        method: 'Session.login',
        params: {
          username: this.hmUser,
          password: this.hmPassword,
        },
      }).then(result => {
        this.$log.debug('Successfully logged in', result)
        this.sessionId = result
        this.setLogoutTimeout()
        return result
      })
    }
  }

  protected setLogoutTimeout() {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer)
    }
    this.timeoutTimer = setTimeout(() => {
      this.logout()
    }, 5000)
  }

  async logout(): Promise<boolean> {
    if (this.sessionId !== null) {
      clearTimeout(this.timeoutTimer)

      this.$log.debug(
        'logging out from hmjson session %s ....',
        this.sessionId
      )
      return this.sendRequest({
        version: '1.1',
        method: 'Session.logout',
        params: {
          _session_id_: this.sessionId,
        },
      }).then(response => {
        this.sessionId = null
        return response
      })
    }
  }

  public sendCommand(aMethod: string, aParams?: any): Promise<any> {
    if (this.sessionId) {
      aParams = aParams || {}
      aParams._session_id_ = this.sessionId
      const command = {
        method: aMethod,
        version: '1.1',
        params: aParams,
      }
      this.$log.debug('hmjson > %s', aMethod)
      return this.sendRequest(command).then(result => {
        this.setLogoutTimeout()
        this.$log.debug('hmjson < %s', aMethod, result.length)
        return result
      })
    } else {
      return this.login().then(() => {
        return this.sendCommand(aMethod, aParams)
      })
    }
  }
}
