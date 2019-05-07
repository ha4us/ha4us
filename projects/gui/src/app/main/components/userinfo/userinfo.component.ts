import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'

import { AuthService } from '@ha4us/ng'

@Component({
  selector: 'ha4us-userinfo',
  templateUrl: './userinfo.component.html',
  styleUrls: ['./userinfo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserinfoComponent implements OnInit {
  authInfo$ = this.as.authInfo$
  constructor(protected as: AuthService) {}

  ngOnInit() {}
}
