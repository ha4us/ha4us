import { MongoClient, Db, Server } from 'mongodb'
import { randomString } from '@ha4us/core/helper'

export class TestMongo {
  protected _dbURLRegexp: RegExp
  public get DBURL() {
    return this._dbURLRegexp
  }

  protected _dbUrl: string
  protected _db: Db

  constructor(
    public mongoUrl: string = 'mongodb://localhost:27017',
    public dbPrefix: string = 'mongo-mock'
  ) {
    this._dbURLRegexp = new RegExp('^' + mongoUrl + '/' + dbPrefix + '-.*$')
  }

  public getUrl(): string {
    if (this._dbUrl) {
      return this._dbUrl
    }

    this._dbUrl = [this.mongoUrl, this.dbPrefix + '-' + randomString(10)].join(
      '/'
    )
    return this._dbUrl
  }

  public getDb(): Promise<Db> {
    if (this._db) {
      return Promise.resolve(this._db)
    } else {
    }
    return MongoClient.connect(this.getUrl(), { useNewUrlParser: true }).then(
      db => {
        this._db = db.db()
        return this._db
      }
    )
  }

  public drop(): Promise<boolean> {
    return this._db.dropDatabase()
  }

  public async listAll(): Promise<string[]> {
    const DBMATCH = new RegExp(this.dbPrefix + '.*')
    const db = await this.getDb()
    // Use the admin database for the operation
    const adminDb = db.admin()

    // List all the available databases
    //
    return new Promise<string[]>((resolve, reject) => {
      adminDb.listDatabases((err, data) => {
        /* istanbul ignore if */
        if (err) {
          reject(err)
        }

        resolve(
          data.databases
            .map(dbase => {
              return dbase.name as string
            })
            .filter((name: string) => DBMATCH.test(name))
        )
      })
    })
  }

  public async dropAll(): Promise<any> {
    const names = await this.listAll()

    const drops = names.map(name =>
      MongoClient.connect([this.mongoUrl, name].join('/')).then(db =>
        db.db().dropDatabase()
      )
    )

    return Promise.all(drops)
  }
}
