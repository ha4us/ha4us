import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import {
  MatButtonModule,
  MatSliderModule,
  MatCardModule,
  MatButtonToggleModule,
  MatListModule,
  MatIconModule,
  MatTabsModule,
  MatTooltipModule,
} from '@angular/material'
import { Ha4usModule } from '@ha4us/ng'
import { MomentModule } from 'ngx-moment'
import { StoreModule } from '@ngrx/store'

import { UsLayoutModule } from '@ulfalfa/ng-util'
import { WidgetsModule } from '@app/widgets'
import { MainModule } from '@app/main'
import { DashboardRoutingModule } from './dashboard-routing.module'
import { DashboardMainComponent } from './components/dashboard-main/dashboard-main.component'
import { DeviceWidgetComponent } from './widgets/device/device.component'

import { FlexLayoutModule } from '@angular/flex-layout'
import { ListItemComponent } from './components/list-item/list-item.component'
import { ChannelButtonComponent } from './widgets/channel-button/channel-button.component'
import { DeviceRemoteComponent } from './widgets/device-remote/device-remote.component'
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component'
import { DeviceThermostatComponent } from './widgets/device-thermostat/device-thermostat.component'
import {
  DashboardHueComponent,
  DashboardSonosComponent,
} from './widgets/devices'
import { NgxGaugeModule } from 'ngx-gauge'

const widgets = [
  DeviceWidgetComponent,
  ChannelButtonComponent,
  DeviceRemoteComponent,
  DeviceThermostatComponent,
  DashboardHueComponent,
  DashboardSonosComponent,
]
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule,
    Ha4usModule,
    MomentModule,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatListModule,
    MatSliderModule,
    MatIconModule,
    MatTooltipModule,
    NgxGaugeModule,
    FlexLayoutModule,
    UsLayoutModule,

    MainModule,
    WidgetsModule.forFeature(widgets, 'dashboard'),
  ],
  declarations: [
    DashboardMainComponent,
    ListItemComponent,
    ...widgets,
    DashboardCardComponent,
  ],
  entryComponents: widgets,
  exports: [DashboardMainComponent, ...widgets],
})
export class Ha4usDashboardModule {}
