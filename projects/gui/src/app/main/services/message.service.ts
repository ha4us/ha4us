import { Injectable } from '@angular/core'
import { Observable, Observer } from 'rxjs'
import { pluck } from 'rxjs/operators'
import { MatSnackBar, MatDialog } from '@angular/material'

import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component'
import { Ha4usError } from '@ha4us/core'
import { sprintf } from 'sprintf-js'

import { Msg, MessageType, MESSAGES as _messages } from '../models/msg'

export interface Ha4usMessage {
  msg: string
  type: MessageType
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
  debug(msg: string, ...args: string[]) {}

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

  observer(msg: Msg): Observer<any> {
    return {
      next: data => this.msg(msg, data),
      error: err => {
        this.error(err)
      },
      complete: () => {},
    }
  }
}
