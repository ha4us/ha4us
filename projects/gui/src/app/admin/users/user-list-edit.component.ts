import { Component, OnInit } from '@angular/core'
import { UserService } from '@ha4us/ng'
import { Ha4usUser } from '@ha4us/core'
import { Observable, never, NEVER } from 'rxjs'
import { tap, mergeMap, map } from 'rxjs/operators'
import { MessageService, Msg } from '@app/main'

@Component({
  selector: 'ha4us-user-list-edit',
  templateUrl: './user-list-edit.component.html',
  styleUrls: ['./user-list-edit.component.scss'],
})
export class UserListEditComponent implements OnInit {
  users: Ha4usUser[]
  showPanel = false

  currentUser: Ha4usUser

  constructor(protected us: UserService, protected ms: MessageService) {}

  ngOnInit() {
    this.us.get().subscribe(data => (this.users = data))
  }

  addUser($event: MouseEvent) {
    this.currentUser = { username: undefined, roles: ['guest'] }
    this.showPanel = true
  }

  editUser(user: Ha4usUser) {
    this.currentUser = user
    this.showPanel = true
  }

  deleteUser($event: MouseEvent, user: Ha4usUser) {
    $event.stopImmediatePropagation()
    this.showPanel = false
    const idx = this.users.findIndex(aUser => aUser.username === user.username)
    if (idx > -1) {
      this.ms
        .confirm(Msg.DeleteReally)
        .pipe(
          mergeMap(confirmed =>
            confirmed
              ? this.us.delete(user.username).pipe(
                  tap(_ => this.users.splice(idx, 1)),
                  map(_ => user.username)
                )
              : NEVER
          )
        )
        .subscribe(this.ms.observer(Msg.UserDeleted))
    }
  }

  userChanged(user: Ha4usUser) {
    this.showPanel = false
    const idx = this.users.findIndex(aUser => aUser.username === user.username)
    if (idx > -1) {
      this.us
        .put(user)

        .pipe(
          tap(puttedUser => (this.users[idx] = puttedUser)),
          map(puttedUser => puttedUser.username)
        )
        .subscribe(this.ms.observer(Msg.UserUpdated))
    } else {
      this.us
        .post(user)
        .pipe(
          tap(newUser => this.users.push(newUser)),
          map(newUser => newUser.username)
        )
        .subscribe(this.ms.observer(Msg.UserCreated))
    }
  }
}
