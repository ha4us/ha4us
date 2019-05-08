import { Subject, Subscription, from, of, never } from 'rxjs'
import { HistoryDb } from './lib/history-db.service'
import {
  tap,
  mergeMap,
  switchMap,
  map,
  toArray,
  delay,
  catchError,
  debounceTime,
  filter,
  onErrorResumeNext,
  scan,
} from 'rxjs/operators'

import { ha4us } from '@ha4us/adapter'
import { StateService, ObjectService, CreateObjectMode } from '@ha4us/adapter'
import {
  Ha4usError,
  Ha4usRole,
  MqttUtil,
  Ha4usObject,
  Ha4usOperators,
} from '@ha4us/core'

const isEqual = require('lodash.isequal')

const ADAPTER_OPTIONS = {
  // h,m,u,p,l,n
  name: 'history',
  path: __dirname + '/..',
  args: {},
  imports: ['$log', '$args', '$states', '$objects'],
}

function Adapter($log, $args, $states: StateService, $objects: ObjectService) {
  async function $onInit() {
    /**
     * create history event db
     */
    $log.info($args.dbUrl)
    const hs = new HistoryDb($args)
    await hs.connect()

    /**
     * process all observed, not retained  status messages with HistoryDb
     */

    hs.processMessages(
      $states.observe('+/#').pipe(
        Ha4usOperators.noRetained,
        tap(msg => $log.debug('Message', msg.match.params)),
        filter(msg => msg.match.params[0] !== $args.name),
        filter(msg => !isEqual(msg.val, msg.old)),
        filter(msg => typeof msg.ts !== 'number'),
        map(msg => ({ ...msg, topic: MqttUtil.splice(msg.topic, 1, 1) }))
      )
    )
      .pipe(
        scan(
          (acc, val) => {
            acc.nInserted += val.nInserted
            acc.nModified += val.nModified

            return acc
          },
          { nInserted: 0, nModified: 0 }
        ),
        debounceTime(5000)
      )
      .subscribe(
        data => {
          $log.debug('Processing', data)
        },
        e => $log.error('Error processing messages', e)
      )

    /**
     * wired up commands for get and aggregate
     */

    $states.command('aggregate', async (args: any) => {
      $log.debug('Command aggregate called', args)

      return hs
        .query(args)
        .pipe(toArray())
        .toPromise()
    })

    $states.command('query', async (args: any) => {
      $log.debug('Command query called', args)
      return hs
        .inventory(args.topic)
        .pipe(toArray())
        .toPromise()
        .catch(e => {
          $log.error('Error while querying', e)
        })
    })

    $states.connected = 2

    return true
  }

  async function $onDestroy() {}

  return {
    $onInit,
    $onDestroy,
  }
}

ha4us(ADAPTER_OPTIONS, Adapter)
