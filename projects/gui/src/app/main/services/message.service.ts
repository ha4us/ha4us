import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { pluck } from 'rxjs/operators'
import { MatSnackBar, MatDialog } from '@angular/material'

import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component'
import { Ha4usError } from '@ha4us/core'
import { sprintf } from 'sprintf-js'

import { Msg } from '../models/msg'

export enum MessageType {
  'debug',
  'info',
  'warn',
  'error',
}

export interface Ha4usMessage {
  msg: string
  type: MessageType
}

const _messages = {
  [Msg.NOTEXISTING]: {
    msg: 'Meldung mit Nummer %d existiert nicht',
    type: MessageType.warn,
  },
  [Msg.Ok]: {
    msg: 'ok.',
    type: MessageType.info,
  },
  [Msg.FileNotFound]: {
    msg: '%s wurde nicht gefunden',
    type: MessageType.warn,
  },
  [Msg.Duplicate]: {
    msg: '%s existiert bereits',
    type: MessageType.error,
  },
  [Msg.ObjectCreated]: {
    msg: 'Objekt %s wurde erfolgreich angelegt',
    type: MessageType.info,
  },
  [Msg.ObjectUpdated]: {
    msg: 'Objekt %s wurde erfolgreich gespeichert',
    type: MessageType.info,
  },
  [Msg.ObjectDeleted]: {
    msg: 'Objekt %s wurde gelöscht',
    type: MessageType.info,
  },
  [Msg.DeleteReally]: {
    msg: 'Wirklich %s löschen?',
    type: MessageType.info,
  },
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(protected sb: MatSnackBar, protected dialog: MatDialog) {}

  private show(msg: Ha4usMessage, args: any[]) {
    this.sb.open(sprintf(msg.msg, args), '', {
      duration: 2000,
      panelClass: ['snack', MessageType[msg.type]],
    })
  }

  msg(msg: Msg, ...args: any[]) {
    let message = _messages[msg]
    message = message || _messages[Msg.NOTEXISTING]
    this.show(message, args)
  }

  wait(msg: Msg, duration: number, ...args: any[]): Promise<boolean> {
    let message = _messages[msg]
    message = message || _messages[Msg.NOTEXISTING]

    const sRef = this.sb.open(sprintf(message.msg, args), 'Upps!', {
      duration,
      panelClass: ['snack', MessageType[message.type]],
    })
    return sRef
      .afterDismissed()
      .pipe(pluck<any, boolean>('dismissedByAction'))
      .toPromise()
  }
  debug(msg: string, ...args: string[]) {
    console.log(msg, args)
  }

  info(msg: string, ...args: any[]) {
    this.show({ msg, type: MessageType.info }, args)
  }

  warn(msg: string, ...args: any[]) {
    this.show({ msg, type: MessageType.warn }, args)
  }
  error(e: Ha4usError, ...args: any[]) {
    let message = _messages[e.code]
    if (!message) {
      message = {
        msg: e.message,
        type: MessageType.error,
      }
    }
    this.show(message, args)
  }

  confirm(msg: Msg): Observable<boolean> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      minWidth: 300,
      data: { msg },
    })

    return ref.afterClosed()
  }
}
