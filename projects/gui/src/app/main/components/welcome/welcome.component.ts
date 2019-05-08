import { environment } from '../../../../environments/environment'
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'ha4us-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  version = environment.version

  constructor() {}

  ngOnInit() {}
}
