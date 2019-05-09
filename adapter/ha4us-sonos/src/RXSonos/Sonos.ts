import * as SonosDiscovery from 'sonos-discovery'
import { Observable, fromEvent, from, merge, Subject } from 'rxjs'
import { map, mergeMap, skipWhile, take, concatMap } from 'rxjs/operators'

import * as Debug from 'debug'

import {
  ISonosPlayer,
  ISonosSystem,
  ISonosTransport,
  ISonosZone,
  ISonosBackup,
  ISonosPreset,
  IVolumeChange,
  ITransportChange,
  IMuteChange,
} from './types'

const debug = Debug('rxsonos.main')

interface IQueueItem {
  players: string[]
  url: string
  volume: number
}

export class Sonos {
  protected _discovery: ISonosSystem

  protected _playQueue$: Subject<IQueueItem> = new Subject<IQueueItem>()

  public topologyChange$: Observable<ISonosZone[]>
  public listChange$: Observable<any>
  public queueChange$: Observable<any>

  public static observePlayer(
    player: ISonosPlayer
  ): Observable<ISonosTransport> {
    return fromEvent(player, 'transport-state')
  }

  public static waitForPlaybackState(player, playbackState): Promise<any> {
    return Sonos.observePlayer(player)
      .pipe(
        skipWhile(
          (state: ISonosTransport) => state.playbackState !== playbackState
        ),
        take(1)
      )
      .toPromise()
  }

  public static backupPlayer(players: ISonosPlayer[]): ISonosBackup[] {
    return players.map((player: ISonosPlayer) => {
      const state = player.state
      const system = player.system

      let groupToRejoin: string

      const backupPreset: ISonosPreset = {
        players: [{ roomName: player.roomName, volume: state.volume }],
        playMode: { repeat: 'NONE' },
        uri: '',
      }

      if (player.coordinator.uuid === player.uuid) {
        // This one is coordinator, you will need to rejoin
        // remember which group you were part of.
        const group = system.zones.find(
          zone => zone.coordinator.uuid === player.coordinator.uuid
        )
        if (group.members.length > 1) {
          groupToRejoin = group.id
          backupPreset.group = group.id
        } else {
          // was stand-alone, so keep state
          backupPreset.state = state.playbackState
          backupPreset.uri = player.avTransportUri
          backupPreset.metadata = player.avTransportUriMetadata
          backupPreset.playMode = {
            repeat: state.playMode.repeat,
          }

          if (!Sonos.isRadioOrLineIn(backupPreset.uri)) {
            backupPreset.trackNo = state.trackNo
            backupPreset.elapsedTime = state.elapsedTime
          }
        }
      } else {
        // Was grouped, so we use the group uri here directly.
        backupPreset.uri = `x-rincon:${player.coordinator.uuid}`
      }

      return { player, group: groupToRejoin, preset: backupPreset }
    })
  }

  public static restorePlayer(backups: ISonosBackup[]) {
    return merge(
      backups.map((backup: ISonosBackup) => {
        if (backup.group) {
          const targetZone = backup.player.system.zones.find(
            zone => zone.id === backup.group
          )
          if (targetZone) {
            backup.preset.uri = `x-rincon:${targetZone.uuid}`
          }
        }
        return backup.player.system.applyPreset(backup.preset)
      })
    )
  }

  public static isRadioOrLineIn(uri) {
    return (
      uri.startsWith('x-sonosapi-stream:') ||
      uri.startsWith('x-sonosapi-radio:') ||
      uri.startsWith('pndrradio:') ||
      uri.startsWith('x-sonosapi-hls:') ||
      uri.startsWith('x-rincon-stream:') ||
      uri.startsWith('x-sonos-htastream:') ||
      uri.startsWith('x-sonosprog-http:')
    )
  }

  public start(): Promise<any> {
    debug('Starting')
    this._discovery = new SonosDiscovery({})
    this.topologyChange$ = fromEvent(this._discovery, 'topology-change')
    this.listChange$ = fromEvent(this._discovery, 'list-change')
    this.queueChange$ = fromEvent(this._discovery, 'queue-change')

    this._playQueue$
      .pipe(
        concatMap((item: IQueueItem) =>
          this._instantPlay(item.players, item.url, item.volume)
        )
      )
      .subscribe(val => {
        debug('Played', val)
      })

    return new Promise(resolve => {
      this._discovery.once('initialized', () => {
        debug('Initialization is done')
        resolve(this.system)
      })
    })
  }

  public get system(): ISonosSystem {
    return this._discovery
  }

  stop(): Promise<void> {
    this._discovery.dispose()
    this._playQueue$.complete()
    return Promise.resolve()
  }

  public observeVolume(): Observable<IVolumeChange> {
    return fromEvent(this._discovery, 'volume-change')
  }

  public observeMute(): Observable<IMuteChange> {
    return fromEvent(this._discovery, 'mute-change')
  }

  public observeTransport(): Observable<ITransportChange> {
    const players: ISonosPlayer[] = this._discovery.players
    return from(players).pipe(
      mergeMap(player =>
        Sonos.observePlayer(player).pipe(
          map((data: any) => ({
            roomName: player.roomName,
            newChange: data,
          }))
        )
      )
    )
  }

  player(playerName: string): ISonosPlayer {
    const player = this._discovery.getPlayer(playerName)

    if (!player) {
      throw new Error(`Player ${playerName} does not exist`)
    }
    return player
  }

  public members(playerName: string): string[] {
    const zones = this._discovery.zones
    const playerZone = zones.find(
      zone => zone.coordinator.roomName === playerName
    )
    return playerZone
      ? playerZone.members.map(player => player.roomName)
      : [playerName]
  }

  public setVolume(playerName: string, vol: number) {
    return this.player(playerName).setVolume(vol)
  }
  public setMute(playerName: string, mute: boolean) {
    const player = this.player(playerName)

    if (mute === true) {
      return player.mute()
    } else {
      return player.unMute()
    }
  }
  public setPause(playerName: string, pause: boolean) {
    const player = this.player(playerName)
    if (pause === true) {
      return player.coordinator.pause()
    } else {
      return player.coordinator.play()
    }
  }

  next(playerName: string) {
    const player = this.player(playerName)
    player.coordinator.nextTrack()
  }
  previous(playerName: string) {
    const player = this.player(playerName)
    player.coordinator.previousTrack()
  }

  public playUrl(rooms: string[], url: string, volume: number = 50) {
    this._playQueue$.next({ players: rooms, url, volume })
  }

  protected _instantPlay(rooms: string[], url: string, volume = 50) {
    const player: ISonosPlayer[] = rooms.map((roomName: string) =>
      this.player(roomName)
    )
    debug(`Playing ${url} clip on ${rooms.join(',')} with volume ${volume}`)
    const clipPreset: ISonosPreset = {
      players: rooms.map((roomName: string) => ({
        roomName,
        volume,
      })),
      playMode: {
        repeat: 'NONE',
      },
      uri: encodeURI(url),
    }

    const backup = Sonos.backupPlayer(player)
    debug('Backup done', backup)
    return player[0].system
      .applyPreset(clipPreset)
      .then(() => Sonos.waitForPlaybackState(player[0], 'PLAYING'))
      .then(() => Sonos.waitForPlaybackState(player[0], 'STOPPED'))
      .then(() => Sonos.restorePlayer(backup))
      .then(() => {
        debug('Backup restored')
      })
  }
}

/*
discvoery:
topology-change
list-change
queue-change

player:
transport-state
mute-change
volume-change
group-mute

system:
volume-change
group-mute

 */
