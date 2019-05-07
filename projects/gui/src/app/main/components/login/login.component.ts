import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '@ha4us/ng';
import { MessageService } from '../../services/message.service';

const debug = require('debug')('ha4us:gui:login:component');

@Component({
  selector: 'ha4us-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  constructor(
    protected fb: FormBuilder,
    protected ms: MessageService,
    protected as: AuthService,
    protected router: Router
  ) {
    this.loginForm = fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {}

  onSubmit() {
    this.ms.debug('Now login');

    const user: { username: string; password: string } = this.loginForm.value;

    this.as
      .login(user.username, user.password)
      .then(data => {
        this.ms.info(` ${user.username} eingelogged`);
        if (this.as.nextState) {
          this.router.navigate([this.as.nextState.url]);
        } else {
          this.router.navigateByUrl('/welcome');
        }
      })
      .catch(e => {
        this.ms.error(e, '');
      });
  }
}
