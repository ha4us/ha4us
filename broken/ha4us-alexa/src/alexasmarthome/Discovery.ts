import { MongoClient, Db, Collection, Cursor, AggregationCursor } from 'mongodb'

import { Ha4usError } from 'ha4us/core'
import { IHa4usLogger } from 'ha4us/adapter'
import { AlexaCapability, IAlexaRequest, IAlexaResponse, IAlexaEndpoint } from './alexa'

import { Observable } from 'rxjs/Observable'

import 'rxjs/add/observable/concat'
import 'rxjs/add/operator/toArray'
import 'rxjs/add/operator/toPromise'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/concatMap'

function cursorToRx(source: AggregationCursor<any>): Observable<any> {
  return Observable.create((observer) => {
    source.each((err, doc) => {
      if (err) {
        observer.error(err)
      } else {
        if (doc) {
          observer.next(doc)
        } else {
          observer.complete()
        }
      }
    })
    return () => {
      return source.close()
    }
  })

}


export default class AlexaDiscovery extends AlexaCapability {

  public static type = 'AlexaInterface'
  public static NAMESPACE = 'Alexa.Discovery'
  public static VERSION = '3'

  protected db: Collection
  constructor($log: IHa4usLogger, $db: Db) {
    super($log, $db, null)
    this.db = $db.collection('objects')

  }

  protected async  generateEndpoints(): Promise<IAlexaEndpoint[]> {

    // const retVal: {name: string, func?: string, room?: string, roles: string[]}[];




    const obsNames = cursorToRx(this.db.aggregate([
      { $match: { tags: 'alexa', name: { $exists: true, $ne: '' }, role: { $exists: true, $ne: null } } },
      { $group: { _id: '$name', roles: { $addToSet: '$role' } } },
      { $project: { _id: 0, name: '$_id', roles: 1 } }
    ]))

    const obsSmartNames = cursorToRx(this.db.aggregate([
      { $match: { tags: 'alexa' } },
      { $unwind: '$tags' },
      { $match: { tags: /^[@#]/ } },
      { $group: { _id: 'test', tags: { $addToSet: '$tags' } } },
      {
        $project: {
          _id: 0, rooms: { $filter: { input: '$tags', as: 'tag', cond: { $eq: [{ $substr: ['$$tag', 0, 1] }, '@'] } } },
          funcs: { $filter: { input: '$tags', as: 'tag', cond: { $eq: [{ $substr: ['$$tag', 0, 1] }, '#'] } } }
        }
      }
    ]))
      .map((roomsAndFuncs: { rooms: string[], funcs: string[] }) => {
        const { rooms, funcs } = roomsAndFuncs
        const names: { room: string, func: string, name: string }[] = []
        rooms.forEach((room: string) => {
          funcs.forEach((func: string) => {
            const name = room.substr(1) + '_' + func.substr(1)
            names.push({ room, func, name })
          })
        })
        return names
      })
      .concatMap(x => x)
      .mergeMap((item: { room: string, func: string, name: string }) => {
        return cursorToRx(this.db.aggregate([
          { $match: { tags: { $all: [item.room, item.func] } } },
          { $group: { _id: 'roles', roles: { $addToSet: '$role' } } },
          { $project: { _id: 0, name: item.name, room: item.room, func: item.func, roles: 1 } }

        ]))
      })
      .map((item: any) => {
        return item
      })



    return Observable.concat(obsNames, obsSmartNames)
    .map((def: any) => {
      if (def.roles.indexOf('PowerLevelController') > -1) {
        def.roles.push ('PowerController')
      }
      return {
          endpointId: def.name,
          friendlyName: def.name,
          description: `Smart Device ${def.name}`,
          manufacturerName: 'ha4us',
          cookie: {
            name: def.name,
            room: def.room,
            func: def.func,
          },
          displayCategories: ['LIGHT'],
          capabilities: def.roles.map ((role: string) => {
            return {
              type: 'AlexaInterface',
              interface: `Alexa.${role}`,
              version: '3'
            }
          })
        }
  }).toArray().toPromise()

  }



  async handleRequest(req: IAlexaRequest): Promise<IAlexaResponse> {

    if (req.directive.header.name === 'Discover') {
      this.validateToken(req.directive.payload.scope.token)
      this.$log.debug('Discover request', JSON.stringify(req))

      const payload = {
        endpoints: []
      }
      payload.endpoints.push({} as IAlexaEndpoint)
      payload.endpoints.push({} as IAlexaEndpoint)


      const res = AlexaDiscovery.createResponse('Discover.Response', AlexaDiscovery.NAMESPACE, AlexaDiscovery.VERSION)

      res.event.payload.endpoints = await this.generateEndpoints()
      return res
    } else {
      throw (new Ha4usError(400, `can't handle ${req.directive.header.name}`))
    }

  }
}
