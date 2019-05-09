import { IHa4usLogger } from 'ha4us/adapter'
import { Ha4usError } from 'ha4us/core'
import { StatesService } from 'ha4us/adapter/features'
import {
  MongoClient,
  Db,
  Collection,
  Cursor,
  AggregationCursor,
} from 'mongodb'
import { cursorToRx } from 'ha4us/adapter/features/mongoFactory'
import * as got from 'got'
import { Observable } from 'rxjs/Observable'

import 'rxjs/add/observable/from'
import 'rxjs/add/operator/toArray'
import 'rxjs/add/operator/toPromise'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/concatMap'

export interface IAlexaEndpoint {
  endpointId: string
  manufacturerName?: string
  friendlyName?: string
  description?: string
  displayCategories?: string[]
  cookie: { name?: string; room?: string; func?: string }
  capbilities?: any[]
  scope?: any
}

export interface CustomSkill {
  handleRequest(req: any, res: any): void
}

export interface IAlexaRequest {
  directive: {
    header: {
      namespace: string;
      name: string;
      payloadVersion: string;
      messageId: string;
      correlationToken?: string;
    };
    payload: any;
    endpoint?: IAlexaEndpoint;
  }
}

export interface IAlexaResponse {
  event: {
    header: {
      namespace: string;
      name: string;
      payloadVersion: string;
      messageId: string;
      correlationToken?: string;
    };
    payload: {
      endpoints?: IAlexaEndpoint[];
      [prop: string]: any;
    };
    endpoint?: IAlexaEndpoint;
  }
}

export abstract class AlexaCapability {
  protected $log: IHa4usLogger
  protected db: Collection
  protected $states: StatesService

  protected static createMessageId() {
    let d = new Date().getTime()

    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      // tslint:disable-next-line:no-bitwise
      const r = (d + Math.random() * 16) % 16 | 0

      d = Math.floor(d / 16)

      // tslint:disable-next-line:no-bitwise
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })

    return uuid
  }
  protected static createResponse(
    name: string,
    namespace: string,
    version: string
  ): IAlexaResponse {
    return {
      event: {
        header: {
          name,
          namespace,
          payloadVersion: version,
          messageId: AlexaCapability.createMessageId(),
        },
        payload: {},
      },
    }
  }

  constructor($log: IHa4usLogger, $db: Db, $states: StatesService) {
    this.$log = $log
    this.db = $db.collection('objects')
    this.$states = $states
  }

  abstract async handleRequest(req: IAlexaRequest): Promise<IAlexaResponse>

  async resolveToken(token: string): Promise<any> {
    const url = `https://api.amazon.com/user/profile?access_token=${encodeURIComponent(
      token
    )}`

    return got(url, { json: true })
      .then(result => {
        this.$log.debug('Profile', result.body)
        return result.body
      })
      .catch(e => {
        this.$log.error('Error', e.response)
        return {}
      })
  }

  async validateToken(token: string): Promise<boolean> {
    const profile = await this.resolveToken(token)
    if (profile.user_id === 'amzn1.account.AE2T3VHMSHNVL2VRFLFL2H5W2DRQ') {
      return
    } else {
      this.$log.warn('Invalid user', profile)
      throw new Ha4usError(403, 'not allowed')
    }
  }

  // const tokenData = req.body.directive.payload.scope.token;

  // const user = await validateToken(req.body.directive.payload.scope.token);
  // ( ( console.log (user.user_id);

  protected getObjects(
    cookie: { room?: string; func?: string; name?: string },
    role: string
  ) {
    let dpCursor: Cursor
    if (cookie.room && cookie.func) {
      dpCursor = this.db.find({
        tags: { $all: [cookie.room, cookie.func, 'alexa'] },
        role,
      })
    } else {
      dpCursor = this.db.find({ name: cookie.name, role })
    }
    return Observable.from(cursorToRx(dpCursor))
  }
}

export abstract class AlexaController extends AlexaCapability {}

/*
Discovery Request:
{
  "directive": {
    "header": {
      "namespace": "Alexa.Discovery",
      "name": "Discover",
      "payloadVersion": "3",
      "messageId": "1bd5d003-31b9-476f-ad03-71d471922820"
    },
    "payload": {
      "scope": {
        "type": "BearerToken",
        "token": "some-access-token"
      }
    }
  }
}

Discovery Response
"header": {
   "namespace": "Alexa.Discovery",
   "name": "Discover.Response",
   "payloadVersion": "3",
   "messageId": "5f8a426e-01e4-4cc9-8b79-65f8bd0fd8a4"
 },

PowerController Request
{
 "directive": {
   "header": {
     "namespace": "Alexa.PowerController",
     "name": "TurnOff",
     "payloadVersion": "3",
     "messageId": "1bd5d003-31b9-476f-ad03-71d471922820",
     "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
   },
   "endpoint": {
     "scope": {
       "type": "BearerToken",
       "token": "some-access-token"
     },
     "endpointId": "appliance-001",
     "cookie": {}
   },
   "payload": {}
 }
}
Response
{
  "context": {
    "properties": [ {
      "namespace": "Alexa.PowerController",
      "name": "powerState",
      "value": "ON",
      "timeOfSample": "2017-02-03T16:20:50.52Z",
      "uncertaintyInMilliseconds": 500
    } ]
  },
  "event": {
    "header": {
      "namespace": "Alexa",
      "name": "Response",
      "payloadVersion": "3",
      "messageId": "5f8a426e-01e4-4cc9-8b79-65f8bd0fd8a4",
      "correlationToken": "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
    },
    "endpoint": {
      "scope": {
        "type": "BearerToken",
        "token": "Alexa-access-token"
      },
      "endpointId": "appliance-001"
    },
    "payload": {}
  }
}
 */
