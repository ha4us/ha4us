import { UserService, Ha4usToken } from '@ha4us/adapter'
import { Ha4usLogger, Ha4usError, Ha4usUser, UserRole } from '@ha4us/core'

import * as cookie from 'cookie'
import * as Mqtt from 'mqtt'

import * as SocketIo from 'socket.io'

import { Observable, Observer } from 'rxjs'

import * as Express from 'express'
import * as http from 'http'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'

import * as compression from 'compression'

export interface Request extends Express.Request {
  token: string
  user: Ha4usUser
  admin: boolean
}

export type Response = Express.Response
export { Router } from 'express'

export class WebService {
  public static bodyParser = bodyParser
  public static cookieParser = cookieParser
  public static static: any = Express.static

  public app: Express.Express
  public api: Express.Router
  public http: http.Server

  public static sendError(res: Express.Response, $log: Ha4usLogger = null) {
    return (e: Ha4usError) => {
      if (e.code) {
        res.status(e.code).send(e.message)
      } else {
        if ($log) {
          $log.error('WebError', e)
        }
        res.status(500).send('please check logs')
      }
    }
  }
  public static sendResponse(res: Express.Response, status: number = 200) {
    return (data: any) => {
      res.status(status).json(data)
    }
  }

  public static hasRole(...sufficientRoles: UserRole[]) {
    return (req: Request, res: Response, next) => {
      try {
        UserService.checkRoles(req.user, ...sufficientRoles)
        return next()
      } catch (e) {
        WebService.sendError(res)(e)
      }
    }
  }

  public static onlyOwn() {
    return (req: Request, res: Response, next) => {
      if (req.admin || req.params.username === req.user.username) {
        next()
      } else {
        res.status(403).send('only admin or the owner can change this record')
      }
    }
  }

  public static setTokenCookie(response: Response, token: Ha4usToken) {
    const cookieOptions = {
      httpOnly: true,
      maxAge: token.exp * 1000,
    }

    response.cookie('token', token.token, cookieOptions)
    response.header('Access-Control-Allow-Origin', '*')
    response.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    response.header('Access-Control-Expose-Headers', 'Authorization')
    response.setHeader('Authorization', ['Bearer', token.token].join(' '))
  }

  constructor(
    protected $users: UserService,
    protected $log: Ha4usLogger,
    protected $args: { name: string; mqttUrl: string }
  ) {
    this.app = Express()
    this.app.use(compression({ threshold: 0 }))
    this.http = http.createServer(this.app)

    this.api = Express.Router()
    this.app.use(
      '/api',
      WebService.cookieParser(),
      this.authMiddleware(),
      this.api
    )
  }

  listen(port: number = 8123): Observable<any> {
    const io = SocketIo(this.http)

    io.use((socket, next) => {
      const handshakeData = socket.request
      if (handshakeData.headers.cookie) {
        const cookies = cookie.parse(handshakeData.headers.cookie)

        this.$log.debug(
          'Mqtt Token ',
          cookies.token,
          handshakeData.headers.cookie
        )

        this.$users
          .isTokenValid(cookies.token)
          .then(() => {
            this.$log.debug('Token is valid')
            next()
          })
          .catch(() => {
            next(new Ha4usError(403, 'Token invalid'))
          })
      } else {
        this.$log.debug('No auth cookie is set')
        return next(
          new Ha4usError(401, 'No authorization information in cookie')
        )
      }
    })

    io.on('connection', socket => {
      this.$log.debug('Connection received')
      const mqtt = Mqtt.connect(this.$args.mqttUrl, {
        clientId:
          this.$args.name +
          '_' +
          Math.random()
            .toString(16)
            .substr(2, 8),
        //          will: {topic: this.$args.name + '/connected', payload: 0, retain: true},
        clean: false,
      })

      mqtt.on('connect', () => {
        socket.on('subscribe', (data: string | string[]) => {
          this.$log.debug('Subscribing', data)
          mqtt.subscribe(data)
        })
        socket.on('unsubscribe', (data: string | string[]) => {
          this.$log.debug('Unsubscribe', data)
          mqtt.unsubscribe(data)
        })
        socket.on('publish', (topic: string, message: any, opts: any) => {
          this.$log.debug('Publish', topic, message, opts)
          mqtt.publish(topic, message, opts)
        })
        mqtt.on('message', (...args) => {
          socket.emit('message', ...args)
        })
      })
      socket.on('disconnect', reason => {
        mqtt.end()
        this.$log.debug('Client disconnected', reason)
      })
    })

    return new Observable((obs: Observer<any>) => {
      this.http.listen(port, () => {
        obs.next({ event: 'online' })
      })
      return () => this.http.close()
    })
  }

  public createRoute(): Express.Router {
    return Express.Router()
  }

  public authMiddleware() {
    return (req: Request, res: Response, next) => {
      // first extract bearer token
      let token = null
      if (req.cookies && req.cookies.token) {
        token = req.cookies.token
      } else if (req.query && req.query.token) {
        token = req.query.token
      } else {
        const bearerHeader = req.get('authorization')
        if (
          typeof bearerHeader !== 'undefined' &&
          bearerHeader.match(/Bearer/)
        ) {
          token = bearerHeader.split(' ')[1]
        }
      }

      if (token) {
        this.$log.debug('Login in with token', token)
        req.token = token
        this.$users
          .isTokenValid(token)
          .then((tokenData: Ha4usToken) => {
            WebService.setTokenCookie(res, tokenData)
            req.user = tokenData.user
            req.token = tokenData.token
            req.admin =
              tokenData.user.roles &&
              tokenData.user.roles.indexOf('admin') > -1
            return next()
          })
          .catch(() => {
            this.$log.warn(
              `Unauthorized access with invalid/expired token ${token} from ${
                req.ip
              }`
            )
            req.token = undefined
            req.user = {
              username: 'guest',
              fullName: 'Guest User',
              roles: ['guest'],
            }
            req.admin = false
            return next()
          })
      }

      if (!req.token) {
        this.$log.debug('No valid found - guest access permitted')
        req.user = {
          username: 'guest',
          fullName: 'Guest User',
          roles: ['guest'],
        }
        req.admin = false
        return next()
      }
    }
  }

  public onlyAuthorized() {
    return (req: Request, res: Response, next) => {
      if (req.token) {
        return next()
      } else {
        this.$log.warn(`Unauthorized - Access without token from ${req.ip}`)
        res.status(401).end()
      }
    }
  }
}
