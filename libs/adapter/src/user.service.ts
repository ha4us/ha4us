import { promisify } from 'util'
import {
  Ha4usLogger,
  Ha4usError,
  Ha4usUser,
  UserRole,
  HA4US_USER,
  randomString,
  defaultsDeep,
} from '@ha4us/core'

import { Ha4usMongoAccess } from './lib/ha4us-mongo-access'

import { Db } from 'mongodb'
import { SignOptions, sign, verify, decode } from 'jsonwebtoken'

import * as bcrypt from 'bcryptjs'
const CRYPT_PREFIX = '{crypt}'
const HASH_REGEXP = /^(?:{(.*)})(.*)$/

const REFRESH_INTERVALL = 1000 * 60 * 10 // 10minutes

const _COLLECTION_ = 'users'

export interface Ha4usToken {
  user: Ha4usUser
  exp: number
  iat: number
  refresh: number
  token: string
}

export class UserService extends Ha4usMongoAccess {
  protected _salt: string
  protected _secret = randomString(10)

  public static get roles(): UserRole[] {
    return ['admin', 'user', 'guest', 'api']
  }

  public static checkRoles(user: Ha4usUser, ...roles: UserRole[]): boolean {
    // everybody is guest
    if (roles.indexOf('guest') > -1 || user.roles.indexOf('admin') > -1) {
      return true
    }

    const userValid = user.roles.reduce((valid: boolean, role: UserRole) => {
      return valid || roles.indexOf(role) > -1
    }, false)

    if (userValid === true) {
      return userValid
    } else {
      throw new Ha4usError(403, `one role of [${roles.join(',')}] needed`)
    }
  }

  constructor(
    $args: { secret?: string; dbUrl: string },
    protected $log: Ha4usLogger
  ) {
    super($args.dbUrl, _COLLECTION_)
    this._salt = bcrypt.genSaltSync(10)

    this._secret = $args.secret || randomString(10)
  }

  public connect() {
    return super.connect().then(db => {
      this.collection.createIndex(
        {
          username: 1,
        },
        {
          unique: true,
          name: 'UniqueUsernames',
        }
      )
      return db
    })
  }

  public createAdminUser(password: string): Promise<Ha4usUser> {
    this.$log.info('Re-creating admin user')

    return this.get('admin')
      .then(user => {
        user.password = password
        return user
      })
      .then(user => this.put(user))
      .catch((e: Ha4usError) => {
        /* istanbul ignore else */
        if (e.code === 404) {
          return this.post({
            username: 'admin',
            password,
            fullName: 'Administrator',
            roles: ['admin'],
          })
        } else {
          throw e
        }
      })
  }

  public get(username: string): Promise<Ha4usUser>
  public get(): Promise<Ha4usUser[]>
  public get(username?: string): Promise<Ha4usUser | Ha4usUser[]> {
    if (username) {
      return this.collection.findOne({ username }).then((user: Ha4usUser) => {
        if (!user) {
          throw new Ha4usError(404, 'user not found')
        }
        return user
      })
    } else {
      const cursor = this.collection.find()
      return cursor.toArray().then((users: Ha4usUser[]) => {
        return users
      })
    }
  }

  protected scramblePassword(user: Ha4usUser): Ha4usUser {
    if (!user.password.match(HASH_REGEXP)) {
      // is a cleartext password
      const hash = bcrypt.hashSync(user.password, this._salt)
      user.password = CRYPT_PREFIX + hash
    }

    return user
  }

  public post(newUser: Ha4usUser): Promise<Ha4usUser> {
    const user = defaultsDeep(newUser, HA4US_USER)
    return this.collection
      .insertOne(this.scramblePassword(user))

      .then(() => user, /*istanbul ignore next*/ Ha4usError.wrapErr)
  }

  public put(userObject: Ha4usUser): Promise<Ha4usUser> {
    userObject = this.scramblePassword(userObject)

    return this.collection
      .replaceOne(
        {
          username: userObject.username,
        },
        userObject
      )
      .then(
        result => {
          if (result.result.nModified === 0) {
            throw new Ha4usError(404, 'not found')
          }
          return userObject
        },
        /* istanbul ignore next */
        e => Ha4usError.wrapErr<Ha4usUser>(e)
      )
  }

  public delete(username: string): Promise<void> {
    return this.collection
      .deleteOne({
        username,
      })
      .then(
        () => undefined,
        /* istanbul ignore next */ e => Ha4usError.wrapErr<void>(e)
      )
  }

  public createToken(user: Ha4usUser): Ha4usToken {
    const expiresIn =
      (user.hasOwnProperty('tokenExp') ? user.tokenExp : 15) * 60
    const jwtOptions: SignOptions = {
      expiresIn,
    }
    delete user._id
    delete user.password

    const token = sign(
      {
        user,
        refresh: Math.round((new Date().valueOf() + REFRESH_INTERVALL) / 1000),
      },
      this._secret,
      jwtOptions
    )

    const tokendata: any = decode(token, { json: true })
    tokendata.user = user
    tokendata.token = token

    return tokendata
  }

  public async isTokenValid(tokenString: string): Promise<Ha4usToken> {
    const _verify = promisify(verify)

    return _verify(tokenString, this._secret)
      .catch(e => {
        throw Ha4usError.generateError(403, 'token invalid', e)
      })
      .then((tokendata: any) => {
        const token: Ha4usToken = tokendata
        token.token = tokenString
        return token
      })
      .then(token => {
        const now = new Date().valueOf()
        if (now > token.refresh * 1000) {
          return this.get(token.user.username).then(user =>
            this.createToken(user)
          )
        } else {
          return token
        }
      })
  }

  /**
   * verifies, that a user (identified by name and password or a valid token) is
   * active user in database
   * @param               usernameOrToken userName or token
   * @param                password       if username, than mandatory
   * @return                  the user dataset without password
   */
  public verify(
    usernameOrToken: string,
    password?: string
  ): Promise<Ha4usUser> {
    let userPromise: Promise<Ha4usUser>
    if (!password) {
      userPromise = this.isTokenValid(usernameOrToken).then(token =>
        this.get(token.user.username)
      )
    } else {
      userPromise = this.get(usernameOrToken).then(user => {
        const hash = HASH_REGEXP.exec(user.password)
        let valid = false
        /* istanbul ignore else */
        if (hash && hash[1] === 'crypt') {
          valid = bcrypt.compareSync(password, hash[2])
        }

        if (valid) {
          return user
        } else {
          throw new Ha4usError(401, 'user not authorized')
        }
      })
    }

    return userPromise.then(user => {
      delete user.password
      return user
    })
  }
}
