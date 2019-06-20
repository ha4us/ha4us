import { Injectable } from '@angular/core'
import { QueryEntity } from '@datorama/akita'
import {
  convertWildcarded,
  Ha4usObject,
  Ha4usObjectSearch,
  Ha4usRole,
  Matcher,
  MqttUtil,
  unique,
} from '@ha4us/core'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ObjectsState, ObjectsStore } from './objects.store'

function topicTree(allTopics: string[]) {
  return allTopics
    .map(topic => {
      const splitted = MqttUtil.split(topic)
      return splitted.map((splitTag, index, arr) =>
        MqttUtil.join(arr.slice(0, index + 1))
      )
    })

    .reduce((prev: string[][], cur: string[]) => {
      for (let i = 0; i < cur.length; i++) {
        if (prev.length < i + 1) {
          prev.push([])
        }
        if (prev[i].indexOf(cur[i]) === -1) {
          prev[i].push(cur[i])
        }
      }
      return prev
    }, [])
}

function allTags(allObjects: Ha4usObject[]) {
  return allObjects.reduce((prev, curObject) => {
    if (curObject.tags && curObject.tags.length > 0) {
      curObject.tags.forEach(tag => {
        if (prev.indexOf(tag) < 0) {
          prev.push(tag)
        }
      })
    }
    return prev
  }, [])
}

@Injectable({ providedIn: 'root' })
export class ObjectsQuery extends QueryEntity<ObjectsState> {
  readonly search$ = this.select(state => state.search)

  readonly searchResult$ = combineLatest(this.search$, this.selectAll()).pipe(
    map(([search, allObjects]) => {
      const query: Ha4usObjectSearch =
        typeof search === 'string'
          ? { pattern: search }
          : (search as Ha4usObjectSearch)
      const matcher = query.pattern ? new Matcher(query.pattern) : null

      const namePattern = query.name ? new RegExp(query.name) : null

      return allObjects.filter(obj => {
        let retValue = true

        if (matcher) {
          retValue = retValue && matcher.test(obj.topic)
        }

        if (retValue && query.tags && query.tags.length > 0) {
          if (obj.tags && obj.tags.length > 0) {
            retValue =
              retValue &&
              query.tags.reduce((prev: boolean, tag: string) => {
                const found = obj.tags.indexOf(tag)
                return prev && found > -1
              }, true)
          } else {
            retValue = false
          }
        }

        if (retValue && query.role) {
          retValue = retValue && obj.role === query.role
        }

        if (retValue && namePattern) {
          retValue = retValue && namePattern.test(obj.label)
        }

        return retValue
      })
    })
  )

  readonly topics$ = this.selectAll().pipe(
    map(objects => objects.map(obj => obj.topic))
  )
  readonly topicTree$ = this.topics$.pipe(map(topicTree))
  readonly allTags$ = this.selectAll().pipe(map(allTags))

  readonly roles$ = this.selectAll().pipe(
    map(allObjects =>
      unique(allObjects.map(obj => obj.role).filter(role => !!role)).sort()
    )
  )

  readonly all$ = this.selectAll()
  readonly objects$ = this.selectAll({ asObject: true })

  constructor(protected store: ObjectsStore) {
    super(store)
  }

  selectByPattern(pattern: string): Observable<Ha4usObject[]> {
    const matcher = new Matcher(pattern)
    return this.selectAll({
      filterBy: obj => matcher.test(obj.topic),
    })
  }

  selectByRole(role: Ha4usRole | string | RegExp): Observable<Ha4usObject[]> {
    if (typeof role === 'string') {
      const roleRegexp = convertWildcarded(role)
      return this.selectAll({
        filterBy: obj => obj.role && roleRegexp.test(obj.role),
      })
    } else {
      return this.selectAll({
        filterBy: obj => obj.role && role.test(obj.role),
      })
    }
  }
}

/*
export function selectOne(topic: string) {
  return createSelector(
    getObjectEntities,
    entities => entities[topic]
  )
}

export function matchByPattern(pattern: string) {
  const matcher = new Matcher(pattern)
  return createSelector(
    getAllObjects,
    allObjects => allObjects.filter(obj => matcher.test(obj.topic))
  )
}

export function selectByRole(role: Ha4usRole | string) {
  const roleRegexp = convertWildcarded(role)
  return createSelector(
    getAllObjects,
    objs => objs.filter(obj => ))
  )
}

export function matchRole(role: RegExp) {
  return createSelector(
    getAllObjects,
    objs => objs.filter(obj => obj.role && role.test(obj.role))
  )
}

export const selectSearched = createSelector(
  getAllObjects,
  getSearch,
  (allObjects, search) => {

)

export const getAllTags = createSelector(
  getAllObjects,
  allObjects =>
    allObjects.reduce((prev, curObject) => {
      if (curObject.tags && curObject.tags.length > 0) {
        curObject.tags.forEach(tag => {
          if (prev.indexOf(tag) < 0) {
            prev.push(tag)
          }
        })
      }
      return prev
    }, [])
)

export const selectRoles = createSelector(
  getAllObjects,
  allObjects =>
    unique(allObjects.map(obj => obj.role).filter(role => !!role)).sort()
)

export const getTopicHierarchie = createSelector(
  getTopics,
  (allTopics: string[]) =>
    allTopics
      .map(topic => {
        const splitted = MqttUtil.split(topic)
        return splitted.map((splitTag, index, arr) =>
          MqttUtil.join(arr.slice(0, index + 1))
        )
      })

      .reduce((prev: string[][], cur: string[]) => {
        for (let i = 0; i < cur.length; i++) {
          if (prev.length < i + 1) {
            prev.push([])
          }
          if (prev[i].indexOf(cur[i]) === -1) {
            prev[i].push(cur[i])
          }
        }
        return prev
      }, [])
)*/
