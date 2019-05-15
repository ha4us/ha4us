import { MongoClient, Db, Cursor, Collection } from 'mongodb'
export type IDBClient = Db

import { Observable } from 'rxjs'
import { URL } from 'url'
const debug = require('debug')('ha4us:adapter:mongofactory')

import { IPager, Ha4usError } from '@ha4us/core'

export namespace MongoUtils {
  export async function paginate<T>(
    cursor: Cursor<T>,
    page: number = -1,
    pagesize: number = 10
  ): Promise<IPager<T> | T[]> {
    if (page === -1) {
      return cursor.toArray()
    }

    const count = await cursor.count()

    page = Math.max(1, Math.min(page, Math.ceil(count / pagesize)))

    const result = await cursor
      .skip((page - 1) * pagesize)
      .limit(pagesize)
      .toArray()
    return {
      length: count,
      pageSize: pagesize,
      page,
      pages: Math.ceil(count / pagesize),
      data: result,
    }
  }

  export function cursorToRx<T>(source: Cursor<T>): Observable<T> {
    return new Observable(observer => {
      source.forEach(
        doc => observer.next(doc),
        err => {
          /* istanbul ignore if */
          if (err) {
            observer.error(err)
          } else {
            observer.complete()
          }
        }
      )
      return () => {
        return source.close()
      }
    })
  }
}

export class Ha4usMongoAccess {
  private static _db: Db = null

  public get db(): Db {
    if (Ha4usMongoAccess._db) {
      return Ha4usMongoAccess._db
    } else {
      throw new Ha4usError(406, `database not connected`)
    }
  }

  private _collection: Collection

  public get collection(): Collection {
    if (this._collection) {
      return this._collection
    } else {
      throw new Ha4usError(
        404,
        `database not connected or collection not defined`
      )
    }
  }

  constructor(protected dbUrl: string, protected collectionName?: string) {}

  async connect() {
    const url = new URL(this.dbUrl)
    debug(
      `connecting to database ${url.host}:${url.port}${url.pathname}`,
      this.dbUrl
    )
    return MongoClient.connect(this.dbUrl, { useNewUrlParser: true }).then(
      client => {
        Ha4usMongoAccess._db = client.db()
        debug(`connected to db ${url.host}:${url.port}${url.pathname}`)
        if (this.collectionName) {
          this._collection = Ha4usMongoAccess._db.collection(
            this.collectionName
          )
        }
        return Ha4usMongoAccess._db
      }
    )
  }
}
