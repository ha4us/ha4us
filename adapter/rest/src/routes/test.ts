import { Router } from 'express'

import { UserService, ObjectService } from 'ha4us/adapter'
import { Ha4usError } from 'ha4us/core'

import { MongoClient, Db, Collection, Cursor, AggregationCursor } from 'mongodb'

import { WebService } from '../web.service'
import { Observable, concat } from 'rxjs'
import { map, concatMap, mergeMap, toArray } from 'rxjs/operators'

module.exports = exports = function(route: Router, { $args, $log, $objects }) {
  function cursorToRx(source: AggregationCursor<any>): Observable<any> {
    return Observable.create(observer => {
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

  route.get('/smart', (req, res) => {
    const db = $objects.collection

    const obsNames = cursorToRx(
      db.aggregate([
        {
          $match: {
            tags: 'alexa',
            name: { $exists: true, $ne: '' },
            role: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: '$name',
            roles: { $addToSet: '$role' },
            topics: { $addToSet: '$topic' },
          },
        },
        { $project: { _id: 0, name: '$_id', roles: 1, topics: 1 } },
      ])
    )

    const obsSmartNames = cursorToRx(
      db.aggregate([
        { $match: { tags: 'alexa' } },
        { $unwind: '$tags' },
        { $match: { tags: /^[@#]/ } },
        { $group: { _id: 'test', tags: { $addToSet: '$tags' } } },
        {
          $project: {
            _id: 0,
            rooms: {
              $filter: {
                input: '$tags',
                as: 'tag',
                cond: { $eq: [{ $substr: ['$$tag', 0, 1] }, '@'] },
              },
            },
            funcs: {
              $filter: {
                input: '$tags',
                as: 'tag',
                cond: { $eq: [{ $substr: ['$$tag', 0, 1] }, '#'] },
              },
            },
          },
        },
      ])
    ).pipe(
      map((roomsAndFuncs: { rooms: string[]; funcs: string[] }) => {
        const { rooms, funcs } = roomsAndFuncs
        const names: { room: string; func: string; name: string }[] = []
        rooms.forEach((room: string) => {
          funcs.forEach((func: string) => {
            const name = room.substr(1) + ' ' + func.substr(1)
            names.push({ room, func, name })
          })
        })
        return names
      }),
      concatMap(x => x),
      mergeMap((item: { room: string; func: string; name: string }) => {
        return cursorToRx(
          db.aggregate([
            { $match: { tags: { $all: [item.room, item.func] } } },
            { $group: { _id: 'roles', roles: { $addToSet: '$role' } } },
            {
              $project: {
                _id: 0,
                name: item.name,
                room: item.room,
                func: item.func,
                roles: 1,
              },
            },
          ])
        )
      }),
      map((item: any) => {
        return item
      })
    )

    return concat(obsNames, obsSmartNames)
      /*.map((def: any) => {
            if (def.roles.indexOf('PowerLevelController') > -1) {
              def.roles.push ('PowerController');
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
        })*/ .pipe(
        toArray()
      )
      .toPromise()
      .then(WebService.sendResponse(res))
      .catch(WebService.sendError(res, $log))
  })
}
