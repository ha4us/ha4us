import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import {
  FormGroup,
  FormBuilder,
  Validators,
  ValidatorFn,
  FormControl,
  FormGroupDirective,
} from '@angular/forms'
import { Ha4usUser } from '@ha4us/core'

// export function checkPasswordValidator(): ValidatorFn {}

@Component({
  selector: 'ha4us-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup

  @Input() set user(user: Ha4usUser) {
    if (user) {
      this.userForm = this.formBuilder.group(
        {
          username: [
            user.username,
            [Validators.required, Validators.pattern(/[a-z0-9]{3,10}/)],
          ],
          fullName: [user.fullName, Validators.required],
          avatarUrn: [user.avatarUrn],
          roles: [user.roles],
          password: [user.password, Validators.required],
          password_repeat: [user.password],
          tokenExp: [user.tokenExp],
          properties: this.formBuilder.group({
            'telegram-chatid': [
              user.properties && user.properties['telegram-chatid'],
            ],
          }),
        },
        { validators: [this.checkPasswords] }
      )
    }
  }

  @Output() userChanged = new EventEmitter<Ha4usUser>()
  @Output() canceled = new EventEmitter<void>()

  confirmErrorMatcher = {
    isErrorState: (control: FormControl, form: FormGroupDirective): boolean => {
      return control.dirty && form.invalid && form.hasError('notSame')
    },
  }

  constructor(protected formBuilder: FormBuilder) {
    this.user = {} as Ha4usUser
  }

  ngOnInit() {}

  onSubmit() {
    const user = this.userForm.value
    if (this.userForm.valid && user.password === user.password_repeat) {
      this.userChanged.next({
        username: user.username,
        fullName: user.fullName,
        password: user.password,
        roles: user.roles,
        tokenExp: user.tokenExp,
        properties: user.properties,
      })
    }
  }

  cancel($event: MouseEvent) {
    this.canceled.next()
  }

  checkPasswords(group: FormGroup) {
    // here we have the 'passwords' group
    const pass = group.controls.password.value
    const confirmPass = group.controls.password_repeat.value

    return (!pass && !confirmPass) || pass === confirmPass
      ? null
      : { notSame: true }
  }
}
