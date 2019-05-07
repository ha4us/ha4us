import { ObjectService, StateService } from './';

import {
  Ha4usObjectQuery,
  Ha4usLogger,
  Ha4usObject,
  IStatefulObject,
  Ha4usMessage,
} from '@ha4us/core';

import { Observable, of } from 'rxjs';

import {
  map,
  mergeMap,
  bufferTime,
  timeout,
  timeoutWith,
  take,
} from 'rxjs/operators';

export class StatefulObjectsService {
  protected $log: Ha4usLogger;

  protected $objects: ObjectService;
  protected $states: StateService;

  constructor(
    $log: Ha4usLogger,
    $objects: ObjectService,
    $states: StateService
  ) {
    this.$objects = $objects;
    this.$states = $states;
    this.$log = $log;
  }

  public observe(query: Ha4usObjectQuery): Observable<IStatefulObject> {
    return this.$objects.observe(query).pipe(
      mergeMap((aObject: Ha4usObject) => {
        return this.$states.observe(aObject.topic).pipe(
          map((state: Ha4usMessage) => {
            delete state.topic;
            delete state.match;
            return {
              object: aObject,
              state: state,
            };
          })
        );
      })
    );
  }

  public get(
    query: Ha4usObjectQuery,
    aTimeout: number = 500
  ): Promise<IStatefulObject[]> {
    return this.$objects
      .observe(query)
      .pipe(
        mergeMap((aObject: Ha4usObject) => {
          return this.$states.observe(aObject.topic).pipe(
            timeoutWith(100, of({})),
            take(1),
            map((state: Ha4usMessage) => {
              delete state.topic;
              delete state.match;
              return {
                object: aObject,
                state: state,
              };
            })
          );
        }),
        bufferTime(aTimeout),
        timeout(aTimeout * 2)
      )
      .toPromise();
  }
}
