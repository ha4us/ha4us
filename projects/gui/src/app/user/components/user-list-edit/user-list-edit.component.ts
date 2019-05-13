import { Component, OnInit } from '@angular/core'
import { UserService } from '@ha4us/ng'
import { Ha4usUser } from '@ha4us/core'

@Component({
  selector: 'ha4us-user-list-edit',
  templateUrl: './user-list-edit.component.html',
  styleUrls: ['./user-list-edit.component.scss'],
})
export class UserListEditComponent implements OnInit {
  users = this.us.get()
  showPanel = false

  currentUser: Ha4usUser

  constructor(protected us: UserService) {}

  ngOnInit() {}

  editUser(user: Ha4usUser) {
    console.log('Edit', user)
    this.currentUser = user
    this.showPanel = true
  }

  deleteUser($event: MouseEvent, user: Ha4usUser) {
    $event.stopImmediatePropagation()
    console.log('Delete')
  }
}
