import { MongoUtils, Ha4usMongoAccess } from './lib/ha4us-mongo-access'

import {
  Ha4usObject,
  Ha4usLogger,
  HA4US_OBJECT,
  Ha4usError,
  Matcher,
  MqttUtil,
  Objectselector,
  IPager,
  AbstractObjectService,
  Ha4usObjectQuery,
  Ha4usObjectEvent,
  defaultsDeep,
  merge,
} from '@ha4us/core'
import { Db, ReplaceWriteOpResult } from 'mongodb'
import { Observable, Subject, from } from 'rxjs'
import { mergeMap, reduce, filter } from 'rxjs/operators'

export enum CreateObjectMode {
  create,
  expand,
  force,
}

function join(name: string, ...topic: string[]) {
  return topic
    .filter(subtopic => typeof subtopic !== 'undefined')
    .map(subtopic => subtopic.replace(/^\$/, name))
    .join(MqttUtil.MQTT_SEP)
}

export type _Without<T> = { [P in keyof T]?: never }
export type _XOR<T, U> = (_Without<T> & U) | (_Without<U> & T)

export interface Ha4usObjectDictionary {
  [subtopic: string]: Partial<Ha4usObject> | Ha4usObjectWithChildren
}

export type WithTopic<T> = T & { topic: string }

type Ha4usObjectWithChildren = [Partial<Ha4usObject>, Ha4usObjectDictionary]

type BuilderContent = Ha4usObjectDictionary | Ha4usObjectWithChildren

function isHa4usObjectWithChildren(
  val: BuilderContent
): val is Ha4usObjectWithChildren {
  return (
    (val as Ha4usObjectDictionary).length &&
    (val as Ha4usObjectDictionary).length === 2
  )
}
function isHa4usObjectDictionary(
  val: BuilderContent
): val is Ha4usObjectDictionary {
  return typeof val === 'object' && !Array.isArray(val)
}

export class ObjectService extends Ha4usMongoAccess
  implements AbstractObjectService {
  protected _events$: Subject<Ha4usObjectEvent> = new Subject()

  public get events$(): Observable<Ha4usObjectEvent> {
    return this._events$
  }

  constructor(
    protected $log: Ha4usLogger,
    protected $args: { dbUrl: string; name: string }
  ) {
    super($args.dbUrl, 'objects')
  }

  public connect(): Promise<Db> {
    this.$log.debug(`Connecting to mongodb`)
    return super.connect().then(() => {
      this.collection.createIndex(
        { topic: 1 },
        { unique: true, name: 'UniqueTopic' }
      )
      return this.db
    })
  }

  protected queryBuilder(query: Ha4usObjectQuery): any {
    const dbQuery: any = {}
    if (typeof query === 'string') {
      const match = new Objectselector(query)
      dbQuery.topic = match.topicRegex
      if (match.tags && match.tags.length > 0) {
        dbQuery.tags = {
          $all: match.tags.map(tag => new RegExp('^' + tag + '$', 'i')),
        }
      }
    } else {
      if (query.pattern) {
        const match = new Matcher(query.pattern)
        dbQuery.topic = match.regexp
      }
      if (query.tags && query.tags.length > 0) {
        dbQuery.tags = {
          $all: query.tags.map(tag => new RegExp('^' + tag + '$', 'i')),
        }
      }
      if (query.name) {
        dbQuery.label = new RegExp('^' + query.name + '$', 'i')
      }

      if (query.role) {
        dbQuery.role = new RegExp(query.role, 'i')
      }
    }
    this.$log.debug('queryBuilder', query, dbQuery)
    return dbQuery
  }

  observe(query: Ha4usObjectQuery): Observable<Ha4usObject> {
    return MongoUtils.cursorToRx(
      this.collection.find(this.queryBuilder(query))
    )
  }

  public getOne<T extends Ha4usObject>(topic: string): Promise<T> {
    return this.collection.findOne({ topic }).then((doc: T) => {
      if (!doc) {
        throw new Ha4usError(404, 'object not found')
      }
      return doc
    })
  }

  /**
   * get
   * @param   query query topicpattern
   * @return  array of ha4usobjects
   */
  public async get(query: Ha4usObjectQuery): Promise<Ha4usObject[]>
  public async get(
    query: Ha4usObjectQuery,
    page: number,
    pagesize?: number
  ): Promise<IPager<Ha4usObject>>
  public async get(
    query: Ha4usObjectQuery,
    page: number = -1,
    pagesize: number = 10
  ): Promise<IPager<Ha4usObject> | Ha4usObject[]> {
    return MongoUtils.paginate(
      this.collection.find(this.queryBuilder(query)),
      page,
      pagesize
    ).then(doc => {
      if (!doc) {
        throw new Ha4usError(404, 'object not found')
      }
      return doc
    })
  }

  public put<T extends Ha4usObject>(obj: T, topic?: string): Promise<T> {
    topic = !topic || topic === '' ? obj.topic : topic
    this.$log.debug('Putting %s', topic, obj)
    delete obj._id
    return this.collection.replaceOne({ topic }, obj).then(result => {
      this.$log.debug('Put Response', result.result)
      if (result.result.nModified === 0) {
        throw new Ha4usError(404, 'not found')
      }
      this._events$.next({ action: 'update', object: obj })
      return obj
    })
  }

  public async post<T extends Ha4usObject>(
    obj: Partial<Ha4usObject>
  ): Promise<T> {
    this.$log.debug('Posting object', obj)
    if (!obj.hasOwnProperty('topic')) {
      throw new Ha4usError(400, 'topic is mandatory')
    }
    const newObject = defaultsDeep(obj, HA4US_OBJECT)

    return this.collection
      .insertOne(newObject)
      .then(result => {
        this.$log.debug('Post Response', result.result)
        this._events$.next({ action: 'insert', object: newObject })
        return newObject as T
      })
      .catch(e => Ha4usError.wrapErr<T>(e))
  }

  public delete<T extends Ha4usObject>(topic: string): Promise<T> {
    return this.getOne(topic)

      .then((obj2del: T) =>
        this.collection.deleteOne({ topic: obj2del.topic }).then(() => obj2del)
      )
      .catch((e: Ha4usError) => {
        return undefined
      })
      .then((deleted: T) => {
        if (deleted) {
          this._events$.next({ action: 'delete', object: deleted })
        }
        return deleted
      })
  }

  /**
   * this method is useful for adapters, that want to create
   * or update an existing object
   *
   *
   * There are currently three modes of operations. All of them ensure
   * that afterwars the object with the given topic exist in database
   * - `create`  creates the object only if not exist (will not touch any existing object)
   *    use this if the object is a whole user object
   * - `expand` expand the existing object with new default or given properties
   * no overwrite (no existing properties will be changed), only native section
   * is replace (default)
   * - `force` the whole object is replaced
   * @param  topic the
   * @param  obj    the object data (Ha4usObjectLike)
   * @param  mode the mode (defaults to expand)
   * @return returns the final object
   *
   * @deprecated it will be removed in next major release - please use create method
   */
  public async install(
    topic: string,
    data: Partial<Ha4usObject> = {},
    mode: CreateObjectMode = CreateObjectMode.expand
  ): Promise<Ha4usObject> {
    // expand topic (replace $ with domain)
    topic = topic ? MqttUtil.join(this.$args.name, topic) : this.$args.name

    // fill data object with defaults : object
    data = defaultsDeep(data, HA4US_OBJECT)

    // set topic : object
    data.topic = topic

    let existingObject: Ha4usObject
    if (mode !== CreateObjectMode.force) {
      try {
        existingObject = await this.getOne(topic)
        if (mode === CreateObjectMode.expand) {
          existingObject.native = data.native
          data = merge(data, existingObject)
        } else {
          data = existingObject
        }
      } catch {}
    }

    return this.collection
      .replaceOne({ topic: data.topic }, data, { upsert: true })
      .then(() => {
        this._events$.next({ action: 'update', object: data as Ha4usObject })
        return data as Ha4usObject
      })
  }

  public new<T extends Ha4usObject>(
    topic: string,
    data: Partial<Ha4usObject> = {}
  ): T {
    data = defaultsDeep(data, HA4US_OBJECT)
    data.topic = topic

    return data as T
  }

  allTags(pattern: string) {
    const match = new Matcher(pattern)
    this.$log.info('All Tags for %s', pattern)
    return this.collection
      .aggregate([
        { $match: { topic: match.regexp } },
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            topics: { $push: '$topic' },
            count: { $sum: 1 },
          },
        },
        { $project: { tag: '$_id', topics: 1, count: true, _id: false } },
      ])
      .toArray()

      .then(result => {
        this.$log.info('Result', result)
        return result
      })
  }

  public async autocomplete(topic: string): Promise<string[]> {
    const topicRegex = new RegExp('^' + topic + '.*', 'i')
    const depth = topic.split('/').length
    this.$log.debug('Autocomplete %s with length %d', topicRegex, depth)
    return this.collection
      .aggregate([
        { $match: { topic: topicRegex } },
        {
          $project: {
            parts: { $slice: [{ $split: ['$topic', '/'] }, depth] },
          },
        },
        { $project: { parts: 1, len: { $size: '$parts' } } },
        { $match: { len: { $eq: depth } } },
        { $group: { _id: '$parts' } },
      ])
      .toArray()

      .then(result => result.map(element => element._id.join('/')))
  }

  protected build(
    root: string,
    children: BuilderContent
  ): WithTopic<Partial<Ha4usObject>>[] {
    const recursiveBuild = (
      parent: string,
      content: BuilderContent
    ): WithTopic<Partial<Ha4usObject>>[] => {
      let result: WithTopic<Partial<Ha4usObject>>[] = []

      if (isHa4usObjectWithChildren(content)) {
        result.push({ ...content[0], topic: join(this.$args.name, parent) })
        result = [
          ...result,
          ...recursiveBuild(join(this.$args.name, parent), content[1]),
        ]
      } else if (isHa4usObjectDictionary(content)) {
        Object.keys(content).forEach(subTopic => {
          const child = content[subTopic]
          if (isHa4usObjectWithChildren(child as BuilderContent)) {
            result = [
              ...result,
              ...recursiveBuild(
                join(this.$args.name, parent, subTopic),
                child as BuilderContent
              ),
            ]
          } else {
            result.push({
              ...(child as Partial<Ha4usObject>),
              topic: join(this.$args.name, parent, subTopic),
            })
          }
        })
      } else {
        throw new Error('Unknown content')
      }

      return result
    }

    return recursiveBuild(root, children)
  }
  create(
    children: BuilderContent,
    options: { mode?: 'update' | 'create'; root?: string } = {}
  ): Observable<{ inserted: number; updated: number; objects: Ha4usObject[] }> {
    return from(this.build(options.root, children)).pipe(
      mergeMap(object => this.upsertOne(object, options.mode || 'update'), 1),
      filter(event => !!event),
      reduce<
        Ha4usObjectEvent,
        { inserted: number; updated: number; objects: Ha4usObject[] }
      >(
        (acc, cur) => {
          acc.inserted += cur.action === 'insert' ? 1 : 0
          acc.updated += cur.action === 'update' ? 1 : 0
          acc.objects.push(cur.object)
          return acc
        },
        { inserted: 0, updated: 0, objects: [] }
      )
    )
  }

  upsertOne(
    object: WithTopic<Partial<Ha4usObject>>,
    mode: 'create' | 'update'
  ): Promise<Ha4usObjectEvent> {
    if (mode === 'create') {
      const completedObject = defaultsDeep(object, HA4US_OBJECT)
      return this.collection
        .insertOne(completedObject)
        .catch(e => {
          if (e.name === 'MongoError' && e.code === 11000) {
            return undefined
          } else {
            throw Ha4usError.wrapErr<Ha4usObjectEvent>(e)
          }
        })
        .then(
          () =>
            ({
              action: 'insert',
              object: completedObject,
            } as Ha4usObjectEvent)
        )
    } else if (mode === 'update') {
      return this.getOne(object.topic)
        .then(loadedObject => {
          return defaultsDeep(object, loadedObject)
        })
        .catch(e => {
          if (e.code === 404) {
            return defaultsDeep(object, HA4US_OBJECT)
          } else {
            throw e
          }
        })
        .then((objectToUpdate: Ha4usObject) =>
          this.collection
            .replaceOne({ topic: objectToUpdate.topic }, objectToUpdate, {
              upsert: true,
            })
            .then(res => [res, objectToUpdate])
        )
        .then(
          ([res, updObject]: [ReplaceWriteOpResult, Ha4usObject]) =>
            ({ action: 'update', object: updObject } as Ha4usObjectEvent)
        )
        .catch(e => Ha4usError.wrapErr as any)
    } else {
      throw new Ha4usError(400, `wrong upsertOne Operation '${mode}' given`)
    }
  }
}
