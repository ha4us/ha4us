const debug = require('debug')('ha4us:fritz:callmonitor')

const moment = require('moment')
import { Socket } from 'net'
import { Observable } from 'rxjs'
import { DateTime } from 'luxon'

import { parsePhoneNumber, CountryCode } from 'libphonenumber-js/max'
export interface FritzOptions {
  host: string
  port: number
  countryCode: CountryCode
  areaCode: string
}

const DEFAULT_OPTIONS: FritzOptions = {
  host: 'fritz.box',
  port: 1012,
  countryCode: 'DE',
  areaCode: '511',
}

export enum EventType {
  'Start' = 'start',
  'Connect' = 'connected',
  'Finished' = 'finished',
}

export enum Direction {
  'Incoming' = 'incoming',
  'Outgoing' = 'outgoing',
}

export interface CallEvent {
  timestamp: Date
  type: EventType
  direction: Direction
  connectionId: number
  extensionLine?: string
  origNumber?: string
  destNumber?: string
  durationSecs?: number
}

export class FritzCallmonitor {
  protected config: FritzOptions = DEFAULT_OPTIONS

  protected connections: Map<any, any> = new Map()

  constructor(config: Partial<FritzOptions> = {}) {
    this.config = Object.assign(this.config, config)
  }

  observe(): Observable<CallEvent> {
    const socket = new Socket()

    const socketObservable = Observable.create(obs => {
      socket.on('data', data => {
        const event = this.parseData(data)
        if (event) {
          obs.next(event)
        }
      })
      socket.on('close', () => obs.complete())
      socket.on('error', e => obs.error(e))

      return () => {
        socket.end()
      }
    })

    socket.connect(this.config.port, this.config.host)

    return socketObservable
  }

  protected parseData(dataBuffer: Buffer): CallEvent {
    const normalizeNumber = aNumber => {
      return parsePhoneNumber(
        aNumber.replace(/^(?=([1-9]))/, this.config.areaCode),
        this.config.countryCode
      ).format('E.164')
    }

    const data = dataBuffer.toString().split(';')
    debug('Data received', data)
    const timestamp = DateTime.fromFormat(
      data[0],
      'dd.MM.yy HH:mm:ss'
    ).toJSDate()
    const connectionId = parseInt(data[2], 10)
    const type = data[1].toLowerCase()

    let event: CallEvent

    switch (type) {
      case 'call':
        // outgoing call detected
        // datum;CALL;ConnectionID;Nebenstelle;GenutzteNummer;    AngerufeneNummer;
        event = {
          timestamp,
          connectionId,
          type: EventType.Start,
          direction: Direction.Outgoing,
          extensionLine: data[3],
          origNumber: normalizeNumber(data[4]),
          destNumber: normalizeNumber(data[5]),
        }
        this.connections.set(connectionId, event)
        return event
      case 'ring':
        // incoming call detected
        // datum;RING;      ConnectionID;Anrufer-Nr; Angerufene-Nummer;
        event = {
          timestamp,
          connectionId,
          type: EventType.Start,
          direction: Direction.Incoming,
          origNumber: normalizeNumber(data[3]),
          destNumber: normalizeNumber(data[4]),
        }
        event.origNumber = normalizeNumber(data[3])
        event.destNumber = normalizeNumber(data[4])
        this.connections.set(connectionId, event)
        return event

      case 'connect':
        // datum;CONNECT;ConnectionId;Nebenstelle;Gegennummer;
        // either an incoming or outgoing call is successfully connected
        event = this.connections.get(connectionId)

        event.type = EventType.Connect
        event.extensionLine = data[3]
        return event

      case 'disconnect': {
        // call terminated
        // datum;DISCONNECT;ConnectionID;dauerInSekunden
        event = this.connections.get(connectionId)
        event.type = EventType.Finished
        event.durationSecs = parseInt(data[3], 10)
        return event
      }
      default:
        debug('Unknown Identifier ' + data[1])
        return undefined
    }
  }
}
