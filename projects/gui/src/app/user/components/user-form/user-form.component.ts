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
          username: [user.username],
          fullName: [user.fullName, Validators.required],
          avatarUrn: [user.avatarUrn],
          roles: [user.roles],
          password: [undefined],
          password_repeat: [undefined],
          tokenExp: [user.tokenExp],
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
    this.userForm = this.formBuilder.group(
      {
        username: ['admin'],
        fullName: ['fullName', Validators.required],
        avatarUrn: [undefined],
        roles: [[]],
        password: [undefined],
        password_repeat: [undefined],
        tokenExp: [undefined],
      },
      { validators: [this.checkPasswords] }
    )
  }

  ngOnInit() {}

  onSubmit() {
    this.userChanged.next(this.userForm.value)
  }

  cancel(_) {
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
