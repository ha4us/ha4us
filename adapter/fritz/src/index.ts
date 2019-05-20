import {
  ha4us,
  Ha4usArguments,
  ObjectService,
  StateService,
  MediaService,
} from '@ha4us/adapter'

import { Ha4usLogger, Ha4usObjectType } from '@ha4us/core'

import { FritzCallmonitor, EventType, Direction } from './lib/fritz-callmonitor'

import { CardDav, Card } from './lib/carddav'
import { Subscription } from 'rxjs'
import { DateTime } from 'luxon'
import { Stream, Writable } from 'stream'

const ADAPTER_OPTIONS = {
  name: 'fritz',
  path: __dirname + '/..',
  args: {
    port: {
      demandOption: false,
      default: 1012,
      describe: 'port of callmonitor',
      type: 'number',
    },
    host: {
      demandOption: false,
      default: 'fritz.box',
      describe: 'host of fritzbox',
      type: 'string',
    },
    country: {
      demandOption: false,
      default: 'DE',
      describe: 'country code',
      type: 'string',
    },
    area: {
      demandOption: false,
      default: '40',
      describe: 'area code',
      type: 'string',
    },
    carddavUri: {
      demandOption: false,
      describe: 'uri of carddav server',
      type: 'string',
    },
  },
  imports: ['$log', '$args', '$states', '$objects', '$media'],
}

function Adapter(
  $log: Ha4usLogger,
  $args: Ha4usArguments,
  $objects: ObjectService,
  $states: StateService,
  $media: MediaService
) {
  let sub: Subscription
  let activeLines = 0
  let missedCalls = 0
  let carddav: CardDav

  async function $onInit() {
    async function resolveNumber(args): Promise<any> {
      if (carddav) {
        $log.debug('Resolving number', args)
        const card = carddav.findByNumber(args)
        if (card.photo) {
          const hash = $media.createHash(
            'DAV',
            [card.fn, card.photo.type].join('.')
          )
          $log.info('Hash', hash)
          return $media
            .postString([card.fn, card.photo.type].join('.'), card.photo.data, {
              id: hash,
              tags: ['carddav'],
              dtl: 30,
              contentType: 'image/' + card.photo.type,
            })
            .catch(e => {
              if (e.code === 409) {
                return $media.getById(hash)
              }
            })
            .then(media => {
              $log.debug('Uploaded', media)
              return {
                fn: card.fn,
                avatar: media.urn,
                tel: card.tel,
              }
            })
        } else {
          return card
        }
      } else {
        return {
          fn: undefined,
          avatar: undefined,
          tel: args,
        }
      }
    }
    await $media.connect()
    const fritz = new FritzCallmonitor({
      host: $args.fritzHost,
      port: $args.fritzPort,
      areaCode: $args.fritzArea,
      countryCode: $args.fritzCountry,
    })

    $objects.install('activeLines', {
      type: Ha4usObjectType.Number,
      role: 'Value/Telephone/ActiveLines',
      can: {
        read: true,
        write: false,
        trigger: true,
      },
    })
    $objects.install('ring', {
      type: Ha4usObjectType.String,
      role: 'Value/Telephone/Ring',
      can: {
        read: false,
        write: false,
        trigger: true,
      },
    })
    $objects.install('call', {
      type: Ha4usObjectType.String,
      role: 'Value/Telephone/Call',
      can: {
        read: false,
        write: false,
        trigger: true,
      },
    })
    $objects.install('missedCalls', {
      type: Ha4usObjectType.Number,
      role: 'Value/Telephone/missedCalls',
      can: {
        read: true,
        write: true,
        trigger: true,
      },
    })
    $objects.install('resetMissed', {
      type: Ha4usObjectType.Any,
      role: 'Value/Telephone/resetMissed',
      can: {
        read: true,
        write: false,
        trigger: true,
      },
    })
    $objects.install('lastCall', {
      type: Ha4usObjectType.Object,
      role: 'Value/Telephone/lastCall',
      can: {
        read: true,
        write: false,
        trigger: true,
      },
    })

    $states.status('$missedCalls', 0, true)
    $states.status('$activeLines', 0, true)
    $states.status('$resetMissed', DateTime.local().toISO(), true)

    if ($args.fritzCarddavUri) {
      carddav = new CardDav({
        uri: $args.fritzCarddavUri,
        countryCode: $args.fritzCountry,
      })
      await carddav.sync()
      $log.info('Connecting to carddav')
    }

    sub = fritz.observe().subscribe(
      async event => {
        $log.debug(event)
        switch (event.type) {
          case EventType.Start:
            $states.status('$activeLines', ++activeLines, true)
            if (event.direction === Direction.Incoming) {
              $states.status(
                '$ring',
                await resolveNumber(event.origNumber),
                false
              )
            } else {
              $states.status(
                '$call',
                await resolveNumber(event.destNumber),
                false
              )
            }

            break
          case EventType.Finished:
            $states.status('$activeLines', --activeLines, true)
            if (
              event.direction === Direction.Incoming &&
              event.durationSecs === 0
            ) {
              $states.status('$missedCalls', ++missedCalls, true)
            }
            if (carddav) {
              const card = await resolveNumber(
                event.direction === Direction.Incoming
                  ? event.origNumber
                  : event.destNumber
              )
              event = { ...event, ...card }
            }

            $states.status('$lastCall', event, true)
            break
          default:
          // do nothing
        }
      },
      err => {
        $log.error(err)
      },
      () => {
        $log.info('Complete')
      }
    )

    sub.add(
      $states.observe('/$set/missedCalls').subscribe(msg => {
        if (msg.val === 0) {
          $states.status('$missedCalls', 0, true)
          missedCalls = 0
          $states.status('$resetMissed', DateTime.local().toISO(), true)
        }
      })
    )
    $states.command('query', async (args: any) => {
      $log.debug('Command query called', args)
      return resolveNumber(args)
    })

    return true
  }

  async function $onDestroy() {
    $log.info('Destroying Fritz Adapter')
    if (sub) {
      sub.unsubscribe()
    }
  }

  return {
    $onInit,
    $onDestroy,
  }
}

ha4us(ADAPTER_OPTIONS, Adapter).catch(e => {
  console.error(e)
})
