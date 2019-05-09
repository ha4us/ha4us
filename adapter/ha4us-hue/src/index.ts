import {
  Ha4usError,
  MqttUtil,
  Ha4usObject,
  Ha4usObjectType,
  isEqual,
} from 'ha4us/core'

import {
  ha4us,
  StateService,
  ObjectService,
  DBMediaService,
  CreateObjectMode,
} from 'ha4us/adapter'

import { Observable, of, interval, from, zip, combineLatest } from 'rxjs'
import {
  mergeMap,
  catchError,
  startWith,
  filter,
  count,
  tap,
} from 'rxjs/operators'

import { HueApi, upnpSearch } from 'node-hue-api'

import { XY2RGBConverter } from './rgb'
import { HUE_MODELS } from './models'

const get = require('lodash.get')

const ADAPTER_OPTIONS = {
  name: 'hue',
  path: __dirname + '/..',
  args: {
    ip: {
      demandOption: false,
      default: 'auto',
      describe: 'id of the hue to connect to',
      type: 'string',
    },
    user: {
      demandOption: false,
      describe: 'hue user - if not known, option to create on start',
      type: 'string',
    },
    poll: {
      demandOption: false,
      default: 5,
      describe: 'polling intervall in sec.',
      type: 'number',
    },
  },
  imports: ['$states', '$objects', '$media'],
}

function Adapter(
  $log,
  $args,
  $states: StateService,
  $objects: ObjectService,
  $media: DBMediaService
) {
  const converterMap: Map<string, XY2RGBConverter> = new Map()

  function createUser(ip) {
    const client = new HueApi()

    $log.debug('Creating User for ip %s', ip)

    return client
      .createUser(ip, $args.name)
      .then(user => {
        $log.debug('User created', user)
        return user
      })
      .catch(error => {
        $log.info('Please press link button and start over again', error)
        throw new Ha4usError(200, 'please press link button before starting')
      })
  }

  async function connectHue() {
    const client = new HueApi($args.hueIp, $args.hueUser)
    try {
      await client.getConfig()
      return client
    } catch (e) {
      $log.error('Connect failed', e)
      throw new Ha4usError(403, 'user not valid')
    }
  }

  async function getObjects(client) {
    const objects = []

    const groups = await client.groups()
    const light2room = {}

    groups
      .filter(group => group.type === 'Room' || group.type === 'LightGroup	')
      .forEach(group => {
        group._topic = group.name
        group._type = 'group'
        if (group.type === 'Room') {
          group.lights.forEach(id => {
            light2room[id] = group.name
          })
        }
        objects.push(group)
      });

    (await client.lights()).lights.forEach(light => {
      light._type = 'light'
      const roomName = light2room[light.id]
      light._topic = roomName ? [roomName, light.name].join('/') : light.name
      light._roomName = roomName

      const cg = get(light, 'capabilities.control.colorgamut')
      if (cg) {
        $log.debug('Adding color property', cg)
        const conv = new XY2RGBConverter(cg)

        converterMap.set(light.id.toString(), conv)
        light.converter = conv
        light.state.color = conv.toRGB(light.state.xy, light.state.bri)
      }

      objects.push(light)
    })

    $log.debug('Objects detected', objects)

    from(objects)
      .pipe(
        mergeMap((obj: any) => {
          return combineLatest(
            of(obj),
            obj._type === 'light' ? from(Object.keys(obj.state)) : from(['on'])
          ).pipe(startWith([obj, undefined]))
        }),
        mergeMap(([obj, state]) => {
          const newObject: Partial<Ha4usObject> = {
            label: obj.name,
            type: Ha4usObjectType.Mixed,
            tags: obj._roomName ? [`@${obj._roomName}`] : [],
            can: {
              read: true,
              write: true,
              trigger: true,
            },
            native: {},
          }

          switch (state) {
            case 'on':
              newObject.type = Ha4usObjectType.Boolean
              newObject.can.trigger = obj._type !== 'group'
              newObject.can.read = obj._type !== 'group'
              newObject.role = 'Toggle/PowerState'
              break
            case 'bri':
              newObject.type = Ha4usObjectType.Number
              newObject.min = 1
              newObject.max = 254
              newObject.role = 'Range/Brightness'
              break
            case 'ct':
              newObject.min = obj.capabilities.control.ct.min
              newObject.max = obj.capabilities.control.ct.max
              newObject.role = 'Range/Color/Temperature'
              break
            case 'xy':
              newObject.type = Ha4usObjectType.Mixed
              newObject.role = 'Range/Color/XY'
              break
            case 'color':
              $log.debug('Creating object for color')
              newObject.type = Ha4usObjectType.String
              newObject.role = 'Input/Color/Rgb'
              break
            case 'hue':
              newObject.type = Ha4usObjectType.Number
              newObject.min = 0
              newObject.max = 65535
              newObject.role = 'Range/Color/Hue'

              break
            case 'sat':
              newObject.type = Ha4usObjectType.Number
              newObject.min = 0
              newObject.max = 254
              newObject.role = 'Range/Color/Saturation'
              break
            case 'alert':
              newObject.type = Ha4usObjectType.String
              newObject.role = 'Mode/Hue/Alert'
              break
            case 'effect':
              newObject.type = Ha4usObjectType.String
              newObject.role = 'Mode/Hue/Effect'
              break
            case 'colormode':
              newObject.type = Ha4usObjectType.String
              newObject.can.write = false
              newObject.role = 'Mode/Color'
              break
            case 'mode':
              newObject.type = Ha4usObjectType.String
              newObject.can.write = false
              newObject.role = 'Mode/Hue/Mode'
              break
            case 'reachable':
              newObject.type = Ha4usObjectType.Boolean
              newObject.can.write = false
              newObject.role = 'Indicator/System/Reachable'
              break
            default:
              newObject.can.read = false
              newObject.can.write = false
              newObject.can.trigger = false;
              (newObject.role = HUE_MODELS[obj.modelid]
                ? HUE_MODELS[obj.modelid].role
                : 'Device/Hue/Unknown'),
                (newObject.image = HUE_MODELS[obj.modelid]
                  ? HUE_MODELS[obj.modelid].image
                  : undefined),
                (newObject.native = {
                  id: obj.id,
                  class: obj.class,
                  type: obj.type,
                  lights: obj.lights,
                  modelid: obj.modelid,
                  manufacturername: obj.manufacturername,
                  productname: obj.productname,
                  uniqueid: obj.uniqueid,
                })
              break
          }
          const topic = !state ? obj._topic : MqttUtil.join(obj._topic, state)

          return $objects.install(topic, newObject, CreateObjectMode.force)
        }),
        tap(obj => $log.debug(`Object ${obj.topic} created`)),
        count(val => !!val)
      )
      .subscribe((_count: number) => {
        $log.info('%d objects created', _count)
      })

    return objects
  }

  async function $onInit(): Promise<boolean> {
    $log.info('Starting hue')
    await $media.connect()
    const medias = await $media.import('assets/**/*', ADAPTER_OPTIONS.path)
    $log.info('%s of %s medias imported', medias.imported.length, medias.count)

    // do autoip discover
    if ($args.hueIp === 'auto') {
      $log.info('Autodiscovering IP')
      const bridges = await upnpSearch(10000)
      if (bridges.length === 1) {
        $args.hueIp = bridges[0].ipaddress
        $log.info('Discovered IP: %s', $args.hueIp)
      } else {
        $log.info('Multiple bridges identified', bridges)
        throw new Ha4usError(500, 'single hue bridge cannot be identified')
      }
    }
    $log.debug('Using hue IP', $args.hueIp)

    if (!$args.hueUser) {
      const user = await createUser($args.hueIp)
      $log.info('Created hue User: %s', user)
      $args.hueUser = user
    }

    $log.debug('Connecting')

    const client = await connectHue()
    // now normally save configuration

    $states.establishCache('$#')

    const objects = await getObjects(client)

    interval($args.huePoll * 1000)
      .pipe(
        startWith(0),
        mergeMap(() => {
          return from(objects)
        }),
        filter(obj => obj._type === 'light'),
        mergeMap((obj: any) => zip(of(obj), client.lightStatus(obj.id)), 3)
      )
      .subscribe(
        ([target, states]) => {
          if (states.state) {
            if (target.converter) {
              (states.state as any).color = target.converter.toRGB(
                states.state.xy,
                states.state.bri
              )
            }
            Object.keys(states.state).forEach(state => {
              $states.status(
                MqttUtil.join(['$' + target._topic, state]),
                states.state[state],
                true
              )
            })
          }
        },
        e => {
          $log.error('Error occurred! Stopping observe of hue system', e)
        }
      )

    $states
      .observe('/$set/#/+')
      .pipe(
        mergeMap(msg => {
          $log.debug('Setting %s to %s', msg.topic, msg.val)
          const [topic, state] = msg.match.params

          const target = objects.find(obj => obj._topic === topic)

          if (!target) {
            $log.warn(`${topic} does not exist`)
            return of()
          }

          if (
            !target.state.hasOwnProperty(state) &&
            !(target.action && !target.action.hasOwnProperty(state))
          ) {
            $log.warn(`${topic} has no state or action ${state}`)
            return of()
          }

          if (state === 'color' && target.converter) {
            return client
              .setLightState(target.id, { xy: target.converter.toXY(msg.val) })
              .catch(e => {
                // just log error and swallow the exception
                $log.error('Error occurred', e)
              })
          } else {
            return client
              .setLightState(target.id, { [state]: msg.val })
              .catch(e => {
                // just log error and swallow the exception
                $log.error('Error occurred', e)
              })
          }
        })
      )
      .subscribe()

    $states.connected = 2

    return true
  }

  async function $onDestroy() {
    $log.info('Destroying hue')
  }

  return {
    $onInit,
    $onDestroy,
  }
}

ha4us(ADAPTER_OPTIONS, Adapter)
