import * as got from 'got'
import {
  ha4us,
  Ha4usArguments,
  Ha4usOptions,
  ObjectService,
  StateService,
  MediaService,
} from '@ha4us/adapter'
import {
  extractTags,
  Ha4usLogger,
  Ha4usMessage,
  Ha4usObject,
  Ha4usObjectType,
  MqttUtil,
} from '@ha4us/core'
import { from, Observable, Subject } from 'rxjs'
import {
  filter,
  map,
  mergeMap,
  scan,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs/operators'
import { URL } from 'url'
import {
  IMuteChange,
  ISonosPlayer,
  ISonosTransport,
  ITransportChange,
  IVolumeChange,
  Sonos,
} from './RXSonos'

const ADAPTER_OPTIONS: Ha4usOptions = {
  name: 'sonos',
  path: __dirname + '/..',
  args: {
    r: {
      alias: 'restUrl',
      demandOption: false,
      default: 'http://sonos:sonospw@127.0.0.1:8081',
      describe: 'Ha4us Rest adapter URL for creating tts',
      type: 'string',
    },
    volume: {
      demandOption: false,
      default: 50,
      describe: 'Default Volume for playing announcements',
      type: 'number',
    },
  },
  imports: ['$log', '$args', '$states', '$objects', '$media'],
  logo: 'sonos-logo.jpg',
}

function Adapter(
  $log: Ha4usLogger,
  $args: Ha4usArguments,
  $states: StateService,
  $objects: ObjectService,
  $media: MediaService
) {
  let sonos: Sonos
  async function $onInit() {
    const restUrl: URL = new URL($args.restUrl)

    $states.establishCache('$#')

    sonos = new Sonos()

    const result = await sonos.start()

    from(result.players)
      .pipe(
        tap((player: ISonosPlayer) =>
          $log.debug(
            'Player found',
            player.roomName,
            player.uuid,
            player.baseUrl
          )
        ),
        mergeMap((player: ISonosPlayer) =>
          $objects.create(
            [
              {
                label: player.roomName,
                role: 'Device/Sonos',
                tags: ['#sonos'],
                native: {
                  uuid: player.uuid,
                  baseUrl: player.baseUrl,
                },
              },
              {
                volume: {
                  type: Ha4usObjectType.Number,
                  role: 'Range/Speaker/Volume',
                  min: 0,
                  max: 100,
                  can: {
                    read: true,
                    write: true,
                    trigger: true,
                  },
                },
                pause: {
                  type: Ha4usObjectType.Boolean,
                  role: 'Toggle/Media/Pause',
                  can: {
                    read: true,
                    write: true,
                    trigger: true,
                  },
                },
                mute: {
                  type: Ha4usObjectType.Boolean,
                  role: 'Toggle/Speaker/Mute',
                  can: {
                    read: true,
                    write: true,
                    trigger: true,
                  },
                },
                next: {
                  type: Ha4usObjectType.Boolean,
                  role: 'Action/Media/Next',
                  can: {
                    read: false,
                    write: true,
                    trigger: false,
                  },
                },
                previous: {
                  type: Ha4usObjectType.Boolean,
                  role: 'Action/Media/Previous',
                  can: {
                    read: false,
                    write: true,
                    trigger: false,
                  },
                },
                announce: {
                  type: Ha4usObjectType.String,
                  role: 'Input/Speaker/Announce',
                  can: {
                    read: false,
                    write: true,
                    trigger: false,
                  },
                },
                info: {
                  type: Ha4usObjectType.Object,
                  role: 'Value/Sonos/Info',
                  can: {
                    read: false,
                    write: false,
                    trigger: true,
                  },
                },
                cover: {
                  type: Ha4usObjectType.Object,
                  role: 'Media/Image/Raster/Coverart',
                  can: {
                    read: false,
                    write: false,
                    trigger: true,
                  },
                },
              },
            ],
            {
              root: MqttUtil.join('$', player.roomName),
              mode: 'create',
            }
          )
        )
      )
      .subscribe(res => {
        $log.debug(`${res.inserted} objects created`)
      })

    sonos.observeVolume().subscribe((data: IVolumeChange) => {
      $log.debug('Volume-Change %s -> %d', data.roomName, data.newVolume)
      $states.status(
        MqttUtil.join('$' + data.roomName, 'volume'),
        data.newVolume,
        true
      )
    })

    sonos.observeMute().subscribe((data: IMuteChange) => {
      $log.debug('Mute-Change', data.roomName)
      $states.status(
        MqttUtil.join('$' + data.roomName, 'mute'),
        data.newMute,
        true
      )
    })

    interface AlbumArt {
      uri: string
      data: string
    }

    const albumUri$: Subject<string> = new Subject()
    const albumBuffer$: Observable<AlbumArt[]> = albumUri$.pipe(
      tap(uri => $log.debug('Getting albumart', uri)),
      switchMap(uri =>
        $media.getMediaFromUrl(uri).then(data => ({ uri, data }))
      ),
      tap(album => {
        $log.debug('Loaded', album.uri)
      }),
      scan((acc: AlbumArt[], newAlbum: AlbumArt) => {
        acc.push(newAlbum)
        return acc.slice(-1 * 5)
      }, []),
      startWith([] as AlbumArt[]),
      shareReplay(1)
    )
    function getAlbumArt(uri: string): Observable<string> {
      return albumBuffer$.pipe(
        tap(data => {
          $log.debug('Album Cache length', data.length)
        }),
        map(albums => {
          $log.debug('Checking ', uri)
          const found = albums.find(album => album.uri === uri)
          if (!found) {
            albumUri$.next(uri)
          } else {
            $log.debug('Found cached', found.uri)
          }
          return found
        }),
        filter(album => !!album),
        take(1),
        map(album => album.data)
      )
    }
    sonos
      .observeTransport()
      .pipe(
        map((data: ITransportChange) => {
          const members = sonos.members(data.roomName)
          members.forEach(room => emitStateForRoom(room, data.newChange))

          return { members, state: data.newChange }
        })
      )
      .subscribe(({ members, state }) => {
        $log.debug('Transport-Change', members)

        getAlbumArt(state.currentTrack.absoluteAlbumArtUri).subscribe(cover => {
          members.forEach(room => {
            $states.status(MqttUtil.join('$' + room, 'cover'), cover, true)
          })
        })
      })

    sonos.topologyChange$.subscribe(zones => {
      $log.debug('Zones change', zones)
    })

    function emitStateForRoom(
      roomName: string,
      status: ISonosTransport,
      albumArtData?: string
    ) {
      $log.debug(`Emitting State for ${roomName}`)
      roomName = '$' + roomName
      $states.status(MqttUtil.join(roomName, 'volume'), status.volume, true)
      $states.status(MqttUtil.join(roomName, 'mute'), status.mute, true)
      $states.status(
        MqttUtil.join(roomName, 'pause'),
        status.playbackState !== 'PLAYING',
        true
      )
      $states.status(MqttUtil.join(roomName, 'info'), status, true)
    }

    $states.observe('/$set/+/+').subscribe((msg: Ha4usMessage) => {
      const [roomName, action] = msg.match.params
      $log.debug('Set activity received', roomName, action, msg.val)

      switch (action) {
        case 'volume':
          return sonos.setVolume(roomName, msg.val)
        case 'mute':
          return sonos.setMute(roomName, msg.val)
        case 'pause':
          return sonos.setPause(roomName, msg.val)
        case 'next':
          return sonos.next(roomName)
        case 'previous':
          return sonos.previous(roomName)
        case 'announce':
          const loginUrl: URL = new URL($args.restUrl + '/api/auth/login')
          $log.debug('Logging into Ha4us-Rest @%s', loginUrl.origin)
          return got
            .get(loginUrl, { json: true })
            .then(response => {
              const token = response.body.token

              const playUrl: URL = new URL(restUrl.origin)
              playUrl.pathname = 'api/media/tts.mp3'

              const [text, volTag] = extractTags(msg.val, '~')
              let volume = volTag
                ? parseInt(volTag.substr(1), 0)
                : $args.sonosVolume

              volume = Math.min(volume, 100)
              volume = Math.max(volume, 0)

              playUrl.search = `say='${text}'&token=${token}`
              $log.debug('Play Text with %s volume %s', text, volume)
              $log.debug('using url', playUrl.toString())
              return sonos.playUrl([roomName], playUrl.toString(), volume)
            })
            .catch(e => {
              if (e.code === 'ECONNREFUSED') {
                $log.error(
                  'Ha4us-Rest API not accessible - no tts possible (%s)',
                  e.message
                )
              } else {
                throw e
              }
            })

        default:
          throw new Error(
            `Action ${action} for player ${roomName} not implemented`
          )
      }
    })
    $states.observe('/$set/+').subscribe((msg: Ha4usMessage) => {
      const [action] = msg.match.params
      $log.debug('Global activity received', action, msg.val)

      switch (action) {
        case 'announce':
          const loginUrl: URL = new URL($args.restUrl + '/api/auth/login')
          $log.debug('Logging into Ha4us-Rest @%s', loginUrl.origin)
          return got
            .get(loginUrl, { json: true })
            .then(response => {
              const token = response.body.token

              const playUrl: URL = new URL(restUrl.origin)
              playUrl.pathname = 'api/media/tts.mp3'

              const [volText, volTag] = extractTags(msg.val, '~')
              let volume = volTag
                ? parseInt(volTag.substr(1), 0)
                : $args.sonosVolume

              volume = Math.min(volume, 100)
              volume = Math.max(volume, 0)

              const [text, ...tags] = extractTags(volText, '@')

              const rooms: string[] = tags.map(roomName => roomName.substr(1))

              playUrl.search = `say='${text}'&token=${token}`
              $log.debug(
                'Play Text with %s volume %s in rooms',
                text,
                volume,
                rooms
              )
              return sonos.playUrl(rooms, playUrl.toString(), volume)
            })
            .catch(e => {
              if (e.code === 'ECONNREFUSED') {
                $log.error(
                  'Ha4us-Rest API not accessible - no tts possible (%s)',
                  e.message
                )
              } else {
                throw e
              }
            })

        default:
          throw new Error(`global Action ${action}  not implemented`)
      }
    })
    return true
  }

  async function $onDestroy() {
    $log.info('Destroying Sonos Adapter')
  }

  return {
    $onInit,
    $onDestroy,
  }
}

ha4us(ADAPTER_OPTIONS, Adapter).catch(e => {
  console.log(e)
})
