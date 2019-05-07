import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChildren,
} from '@angular/core'
import { MatTab } from '@angular/material'
import { ActivatedRoute, ChildActivationEnd } from '@angular/router'
import { SettingsService } from '@ha4us/ng'
import { take, map, tap, filter } from 'rxjs/operators'
@Component({
  selector: 'ha4us-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  tabs = ['dashboard', 'roles']
  settings$ = this.settings.setting$
  constructor(
    protected route: ActivatedRoute,
    protected settings: SettingsService
  ) {}

  back = false
  selectedTab = this.route.paramMap.pipe(
    map(params => params.get('setting')),
    filter(setting => !!setting),
    //  tap(setting=>console.log ('Swit'))
    map(setting => this.tabs.findIndex(tab => setting.toLowerCase() === tab)),
    tap(idx => (this.back = idx > -1))
  )
  ngOnInit() {}

  saveSettings(path: string, val: any) {
    this.settings.set(path, val)
  }
}
